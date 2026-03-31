import React from "react";
import { Card, CardContent, Typography, CardActionArea, Box } from "@mui/material";
import { Link } from "react-router-dom";

function PanelCard({
  primaryText,
  secondaryText,
  icon,
  gradientBg,
  textColor = "#fff",
  onClick,
  to,
}) {
  return (
    <Card
      sx={{
        background: gradientBg || "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        borderRadius: "16px",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
        },
        "&:hover .panel-icon-circle": {
          transform: "scale(1.15) rotate(8deg)",
        },
        "&:hover .panel-deco-circle": {
          transform: "scale(1.3)",
          opacity: 0.15,
        },
      }}
    >
      {/* Decorative circles */}
      <Box
        className="panel-deco-circle"
        sx={{
          position: "absolute",
          top: -25,
          right: -25,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.1)",
          transition: "all 0.5s ease",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -15,
          left: -15,
          width: 60,
          height: 60,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.06)",
        }}
      />

      <CardActionArea 
        component={to ? Link : "div"} 
        to={to} 
        onClick={onClick}
        sx={{ height: "100%", p: 0.5, position: "relative", zIndex: 1 }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 3 }}>
          {icon && (
            <Box 
              className="panel-icon-circle"
              sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: "16px", 
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                display: "inline-flex",
                color: textColor,
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {React.cloneElement(icon, { style: { fontSize: 34 } })}
            </Box>
          )}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 800, 
              color: textColor, 
              mb: 0.5, 
              fontSize: '1.05rem',
              letterSpacing: "-0.3px",
              textShadow: "0 1px 3px rgba(0,0,0,0.15)" 
            }}
          >
            {primaryText}
          </Typography>
          <Typography
            variant="caption"
            sx={{ 
              fontWeight: 500, 
              color: "rgba(255,255,255,0.8)", 
              lineHeight: 1.5,
              fontSize: "0.78rem"
            }}
          >
            {secondaryText}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default PanelCard;
