"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import React from "react";

const Logout = () => {
  return (
    <div>
      <Button onClick={() => authClient.signOut()} variant="destructive">
        Logout
      </Button>
    </div>
  );
};

export default Logout;
