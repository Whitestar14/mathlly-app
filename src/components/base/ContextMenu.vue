<template>
    <ContextMenuRoot>
      <ContextMenuTrigger asChild>
        <slot name="trigger"></slot>
      </ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent
          class="z-20 min-w-[180px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-1 shadow-md"
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
  .context-menu-item,
  .context-menu-item-danger {
    @apply flex items-center text-sm w-full px-2 py-1.5 first:rounded-t-md last:rounded-b-md cursor-pointer outline-none;
  }
  .context-menu-item {
    @apply hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300;
  }
  
  .context-menu-item-danger {
    @apply hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400;
  }
  </style>
  