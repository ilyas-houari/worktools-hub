import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: React.ReactNode;
}

export type ViewState = 'welcome' | string; // 'welcome' or toolId