<template>
    <ContextMenuRoot>
      <ContextMenuTrigger asChild>
        <slot name="trigger"></slot>
      </ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent
          class="context-menu-container"
          :side-offset="sideOffset"
          :align="align"
        >
          <slot></slot>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenuRoot>
  </template>
  
  <script setup>
  import {
    ContextMenuRoot,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuPortal,
  } from "radix-vue";
  
  defineProps({
    sideOffset: {
      type: Number,
      default: 5
    },
    align: {
      type: String,
      default: 'start'
    }
  });
  </script>
  
  <style>
  .context-menu-container {
    @apply z-[100] min-w-[180px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-1 shadow-md;
  }
  
  .context-menu-item {
    @apply flex items-center text-sm w-full px-2 py-1.5 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 outline-none;
  }
  
  .context-menu-item-danger {
    @apply flex items-center text-sm w-full px-2 py-1.5 hover:bg-red-100 first:rounded-t-md last:rounded-b-md dark:hover:bg-red-900/30 cursor-pointer text-red-600 dark:text-red-400 outline-none;
  }
  </style>
  