import React, { type CSSProperties } from 'react'

interface DividerComponent {
    orientation?: "horizontal" | "vertical";
    style?: CSSProperties;
}

export const Divider: React.FC<DividerComponent> = ({
    orientation = "horizontal",
    style = {}
}) => {    
    
    if (orientation === "vertical") {
        return (
            <div 
                style = {{
                    height: "100%",
                    width: "1px",
                    background: "#7e7e7e",
                    alignSelf: "stretch",
                    ...style
                }}
                role="separator"/>
            )
    };
    
    if (orientation === "horizontal") {
        return (
            <div 
                style = {{
                    borderTop: "1px solid #7e7e7e",
                    width: "100%",
                    marginTop: "5px",
                    marginBottom: "5px",
                    ...style
                }}
                role="separator"/>
            )
    }
}