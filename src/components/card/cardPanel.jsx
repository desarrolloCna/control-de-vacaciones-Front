import React from "react";
import { Card, CardContent, Typography, CardActionArea, Box } from "@mui/material";
import { Link } from "react-router-dom";

function PanelCard({
  primaryText,
  secondaryText,
  icon,
  gradientBg, // Cambiado de backgroundColor a gradientBg
  textColor = "#fff",
  onClick,
  to,
}) {
  return (
    <Card
      sx={{
        background: gradientBg || "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        borderRadius: "12px",
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
        },
      }}
    >
      <CardActionArea 
        component={to ? Link : "div"} 
        to={to} 
        onClick={onClick}
        sx={{ height: "100%", p: 0.5 }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 2 }}>
          {icon && (
            <Box 
              sx={{ 
                p: 1.5, 
                mb: 1.5, 
                borderRadius: "50%", 
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "inline-flex",
                color: textColor 
              }}
            >
              {React.cloneElement(icon, { style: { fontSize: 32 } })}
            </Box>
          )}
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: textColor, mb: 0.5, fontSize: '1rem' }}>
            {primaryText}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}
          >
            {secondaryText}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default PanelCard;
