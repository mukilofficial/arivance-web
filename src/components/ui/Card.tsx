import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

export function Card({ className, glass = true, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/10 p-6",
                glass && "bg-white/5 backdrop-blur-lg shadow-xl",
                className
            )}
            {...props}
        />
    );
}
