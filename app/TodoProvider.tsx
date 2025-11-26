"use client";
import { SnackbarProvider } from "notistack";
import React from "react";

export const ToDoProvider = ({ children }: { children: React.ReactNode }) => {
  return <SnackbarProvider maxSnack={5}>{children}</SnackbarProvider>;
};
