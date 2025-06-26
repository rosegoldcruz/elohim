interface CalloutProps {
    icon?: string;
    children?: React.ReactNode;
    type?: "default" | "warning" | "danger" | "info";
}
export declare function Callout({ children, icon, type, ...props }: CalloutProps): import("react").JSX.Element;
export {};
