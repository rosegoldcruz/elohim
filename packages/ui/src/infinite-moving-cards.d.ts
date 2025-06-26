import * as React from "react";
export declare const InfiniteMovingCards: ({ items, direction, speed, pauseOnHover, className, }: {
    items: {
        quote: string;
        name: string;
        title: string;
    }[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}) => React.JSX.Element;
