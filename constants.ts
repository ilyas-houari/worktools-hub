import React from 'react';
import { Tool } from './types';
import { UserPlus, Shuffle, UserX } from 'lucide-react';
import AddContactYahoo from './components/AddContactYahoo';
import GroupedShuffle from './components/GroupedShuffle';
import RemoveBlocked from './components/RemoveBlocked';

// This is where we will register new tools in the future.
export const TOOLS: Tool[] = [
  {
    id: 'grouped-shuffle',
    name: 'Grouped Shuffle',
    description: 'Shuffle items within groups and interleave them for balanced output.',
    icon: Shuffle,
    component: React.createElement(GroupedShuffle)
  },
  {
    id: 'remove-blocked',
    name: 'Remove Blocked',
    description: 'Filter out blocked profiles from spreadsheet data based on specific tags.',
    icon: UserX,
    component: React.createElement(RemoveBlocked)
  },
  {
    id: 'add-contact-yahoo',
    name: 'ADD CONTACT Yahoo',
    description: 'This tool will be implemented later.',
    icon: UserPlus,
    component: React.createElement(AddContactYahoo)
  }
];