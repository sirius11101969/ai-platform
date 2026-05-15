import React from "react";

const motionOnlyProps = new Set([
  "animate",
  "exit",
  "initial",
  "layout",
  "layoutId",
  "transition",
  "variants",
  "viewport",
  "whileHover",
  "whileInView",
  "whileTap",
]);

const mergeMotionStyle = (props) => {
  const { initial, animate, whileInView, style } = props;
  const target = (whileInView && typeof whileInView === "object" ? whileInView : null)
    || (animate && typeof animate === "object" ? animate : null)
    || (initial && typeof initial === "object" ? initial : null)
    || {};

  const nextStyle = { ...style };
  if (typeof target.opacity === "number") nextStyle.opacity = target.opacity;
  if (typeof target.scale === "number") nextStyle.transform = `scale(${target.scale})`;
  if (typeof target.y === "number") nextStyle.transform = `${nextStyle.transform || ""} translateY(${target.y}px)`.trim();
  return nextStyle;
};

const createMotionComponent = (tag) => React.forwardRef(function MotionComponent(props, ref) {
  const safeProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (!motionOnlyProps.has(key)) safeProps[key] = value;
  }
  safeProps.ref = ref;
  safeProps.style = mergeMotionStyle(props);
  return React.createElement(tag, safeProps);
});

export const motion = new Proxy({}, {
  get: (_, tag) => createMotionComponent(tag),
});

export const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);
