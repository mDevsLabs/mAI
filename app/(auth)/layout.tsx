import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Preview } from "@/components/chat/preview";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen bg-sidebar">
      <div className="flex w-full flex-col bg-background p-8 xl:w-[600px] xl:shrink-0 xl:rounded-r-2xl xl:border-r xl:border-border/40 md:p-16">
        <Link
          className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          <ArrowLeftIcon className="size-3.5" />
          Retour
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
              <Image alt="mAI" className="size-5" src="/logo.png" width={20} height={20} />
            </div>
            {children}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 flex-col overflow-hidden pl-12 xl:flex">
        <div className="flex items-center gap-1.5 pt-8 text-[13px] text-muted-foreground/50">
          Propulsé par
          <span className="font-medium text-muted-foreground">mAI</span>
        </div>
        <div className="flex-1 pt-4">
          <Preview />
        </div>
      </div>
    </div>
  );
}
