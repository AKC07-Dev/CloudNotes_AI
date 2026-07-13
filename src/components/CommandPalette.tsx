import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Bell,
  Bookmark,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  Upload,
  Users,
  User,
} from "lucide-react";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/feed")}>
            <Home className="h-4 w-4 mr-2" /> Home Feed
          </CommandItem>
          <CommandItem onSelect={() => go("/search")}>
            <Search className="h-4 w-4 mr-2" /> Search
          </CommandItem>
          <CommandItem onSelect={() => go("/communities")}>
            <Users className="h-4 w-4 mr-2" /> Communities
          </CommandItem>
          <CommandItem onSelect={() => go("/bookmarks")}>
            <Bookmark className="h-4 w-4 mr-2" /> Bookmarks
          </CommandItem>
          <CommandItem onSelect={() => go("/notifications")}>
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/upload")}>
            <Upload className="h-4 w-4 mr-2" /> Upload new note
          </CommandItem>
          <CommandItem onSelect={() => go("/profile")}>
            <User className="h-4 w-4 mr-2" /> My profile
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings className="h-4 w-4 mr-2" /> Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
