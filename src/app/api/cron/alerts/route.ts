import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMonths, addDays, subDays } from "date-fns";

export async function GET() {
  try {
    // 1. Passport Expiry Alerts
    // Find passports expiring within the next 6 months
    const sixMonthsFromNow = addMonths(new Date(), 6);
    const now = new Date();
    const passports = await prisma.passport.findMany({
      where: {
        expiryDate: {
          lt: sixMonthsFromNow,
          gt: now, // Not already expired
        },
      },
      include: {
        customer: {
          include: {
            leads: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
            bookings: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                lead: true,
              },
            },
            interactions: {
              orderBy: {
                date: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    let passportAlertsCount = 0;

    for (const passport of passports) {
      // Determine the agent to notify
      // Strategy: 
      // 1. Use agent from most recent lead
      // 2. If no lead, use agent from most recent booking's lead
      // 3. If no booking lead, use agent from most recent interaction
      let agentId: string | undefined;
      
      if (passport.customer.leads.length > 0) {
        agentId = passport.customer.leads[0]?.agentId;
      } else if (passport.customer.bookings.length > 0 && passport.customer.bookings[0]?.lead) {
        agentId = passport.customer.bookings[0].lead.agentId;
      } else if (passport.customer.interactions.length > 0) {
        agentId = passport.customer.interactions[0]?.agentId;
      }

      if (agentId) {
        // Check for existing notification created within the alert window (6 months)
        // This prevents duplicate notifications even if the previous one was read
        const sixMonthsAgo = subDays(now, 180);
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: agentId,
            type: "PASSPORT_EXPIRY",
            entityId: passport.id,
            createdAt: {
              gte: sixMonthsAgo,
            },
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: agentId,
              type: "PASSPORT_EXPIRY",
              title: "Passport Expiring Soon",
              message: `Passport for ${passport.customer.firstNameEn} ${passport.customer.lastNameEn} expires on ${passport.expiryDate.toLocaleDateString()}`,
              link: `/dashboard/customers/${passport.customer.id}`,
              entityId: passport.id,
            },
          });
          passportAlertsCount++;
        }
      }
    }

    // 2. Trip Upcoming Alerts
    // Find trips starting within the next 7 days
    const sevenDaysFromNow = addDays(now, 7);
    const upcomingTrips = await prisma.trip.findMany({
      where: {
        startDate: {
          lt: sevenDaysFromNow,
          gt: now,
        },
      },
      include: {
        bookings: {
          where: {
            status: "CONFIRMED",
          },
          include: {
            customer: {
              include: {
                leads: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
                interactions: {
                  orderBy: {
                    date: "desc",
                  },
                  take: 1,
                },
              },
            },
            lead: true,
          },
        },
      },
    });

    let tripAlertsCount = 0;

    for (const trip of upcomingTrips) {
      for (const booking of trip.bookings) {
        // Determine the agent to notify
        // Strategy:
        // 1. Use agent from booking's lead
        // 2. If no booking lead, use agent from customer's most recent lead
        // 3. If no lead, use agent from customer's most recent interaction
        let agentId: string | undefined;
        
        if (booking.lead) {
          agentId = booking.lead.agentId;
        } else if (booking.customer.leads.length > 0) {
          agentId = booking.customer.leads[0]?.agentId;
        } else if (booking.customer.interactions.length > 0) {
          agentId = booking.customer.interactions[0]?.agentId;
        }

        if (agentId) {
          // Check for existing notification created within the alert window (7 days)
          // This prevents duplicate notifications even if the previous one was read
          const sevenDaysAgo = subDays(now, 7);
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: agentId,
              type: "TRIP_UPCOMING",
              entityId: booking.id,
              createdAt: {
                gte: sevenDaysAgo,
              },
            },
          });

          if (!existingNotification) {
            await prisma.notification.create({
              data: {
                userId: agentId,
                type: "TRIP_UPCOMING",
                title: "Upcoming Trip",
                message: `Trip "${trip.name}" for ${booking.customer.firstNameEn} ${booking.customer.lastNameEn} starts on ${trip.startDate.toLocaleDateString()}`,
                link: `/dashboard/bookings/${booking.id}`,
                entityId: booking.id,
              },
            });
            tripAlertsCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      passportAlertsGenerated: passportAlertsCount,
      tripAlertsGenerated: tripAlertsCount,
    });
  } catch (error) {
    console.error("[CRON_ALERTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
