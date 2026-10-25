//Just spending stupid time to make plus and minus sign
import React from "react";

interface PlusMinusComponent {
    isPlus?: boolean;
    size?: string;
    plusColor?: string;
    minusColor?: string
}

export const PlusMinus: React.FC<PlusMinusComponent> = ({
    isPlus = true,
    size = "5",
    plusColor = "#239cd8",
    minusColor = "#a44f1d"
}) => {

    const signContainer: React.CSSProperties = {
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "15px"
    }

    const baseStrip: React.CSSProperties = {
        position: "absolute",
        border: "1px solid #dbdbdb",
        height: '2px',
        verticalAlign: "center",
        background: isPlus ? plusColor : minusColor,
        borderColor: isPlus ? plusColor : minusColor,
        transition: "width 0.25s ease-in-out, background 0.25s ease, borderColor 0.25s ease"
    }

    const horizontalStrip: React.CSSProperties = {
        ...baseStrip,
        width: `${size}px`,
    }

    const verticalStrip: React.CSSProperties = {
        ...baseStrip,
        width: isPlus ? `${size}px` : "0px",
        transform: "rotate(90deg)",
    }

    return (
        <div style={{display: "inline-flex", alignItems: "center"}}>
            <div style={signContainer}>
                <div style={horizontalStrip}></div>
                <div style={verticalStrip}></div>
            </div>      
        </div>
    )
}