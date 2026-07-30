import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 px-6 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="ml-4 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
