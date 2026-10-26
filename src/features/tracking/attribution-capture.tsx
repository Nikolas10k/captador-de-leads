"use client";

import { useEffect } from "react";
import { captureAttribution } from "./attribution";

export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
