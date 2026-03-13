"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  imageUrl?: string | null;
  groupTitle?: string | null;
}

export function EditChannelDialog({ channel, updateAction }: { channel: Channel, updateAction: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-white/10">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0A0A0A] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Edytuj Kanał</DialogTitle>
        </DialogHeader>
        <form action={async (formData) => {
            await updateAction(formData);
            setOpen(false);
        }} className="space-y-4 mt-4">
          <input type="hidden" name="channelId" value={channel.id} />
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nazwa Kanału</label>
            <Input name="name" defaultValue={channel.name} required className="bg-white/5 border-white/10" />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grupa / Kategoria</label>
            <Input name="groupTitle" defaultValue={channel.groupTitle || ""} className="bg-white/5 border-white/10" />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Strumienia (M3U8)</label>
            <Input name="streamUrl" defaultValue={channel.streamUrl} required className="bg-white/5 border-white/10" />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Logo</label>
            <Input name="imageUrl" defaultValue={channel.imageUrl || ""} className="bg-white/5 border-white/10" />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Anuluj</Button>
            <Button type="submit">Zapisz Zmiany</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
