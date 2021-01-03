import React from 'react';

export interface HeaderProps {
    title: boolean;
    icon: string | null;
}

export const Header: React.FunctionComponent<HeaderProps> = ({title}) => {
    return (
        <h1>{title}</h1>
    );
}
