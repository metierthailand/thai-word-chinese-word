"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

import { LayoutDashboard, Users, Target, Calendar, Plane, Search, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const searchItems = [
  { group: "Main", icon: LayoutDashboard, label: "Dashboard", url: "/dashboard" },
  { group: "Main", icon: Users, label: "Customers", url: "/dashboard/customers" },
  { group: "Main", icon: Tag, label: "Tags", url: "/dashboard/tags" },
  { group: "Main", icon: Target, label: "Leads", url: "/dashboard/leads" },
  { group: "Main", icon: Calendar, label: "Bookings", url: "/dashboard/bookings" },
  { group: "Main", icon: Plane, label: "Trips", url: "/dashboard/trips" },
];

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="link"
        className="text-muted-foreground px-0! font-normal hover:no-underline"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Search
        <kbd className="bg-muted inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium select-none">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search dashboards, users, and more…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {[...new Set(searchItems.map((item) => item.group))].map((group, i) => (
            <React.Fragment key={group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={group} key={group}>
                {searchItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem
                      className="py-1.5!"
                      key={item.label}
                      onSelect={() => {
                        setOpen(false);
                        if (item.url) {
                          router.push(item.url);
                        }
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
