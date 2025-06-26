import React from "react";
export declare const CardContainer: ({ children, className, containerClassName, }: {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) => any;
export declare const CardBody: ({ children, className, }: {
    children: React.ReactNode;
    className?: string;
}) => any;
export declare const CardItem: ({ as: Tag, children, className, translateX, translateY, translateZ, rotateX, rotateY, rotateZ, ...rest }: {
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    translateX?: number | string;
    translateY?: number | string;
    translateZ?: number | string;
    rotateX?: number | string;
    rotateY?: number | string;
    rotateZ?: number | string;
}) => any;
export declare const useMouseEnter: () => [boolean, React.Dispatch<React.SetStateAction<boolean>>];
