<template>
  <NavigationMenu class="flex-grow p-4">
    <NavigationMenuList>
      <NavigationMenuItem v-for="(item, index) in navItems" :key="item.id || index">
        <NavigationMenuLink
          :active="selectedIndex === index"
          @click="selectNavItem(index)"
          class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors w-full"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.label }}</span>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
    <NavigationMenuIndicator class="NavigationMenuIndicator" />
  </NavigationMenu>
</template>

<script setup>
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "radix-vue";
import { defineProps, defineEmits, ref } from "vue";

const props = defineProps({
  navItems: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["selectItem"]);

const selectedIndex = ref(0);

const selectNavItem = (index) => {
  selectedIndex.value = index;
  emit("selectItem", index);
};
</script>

<style scoped>
.NavigationMenuIndicator {
  display: block;
  width: 4px;
  height: 40px;
  background-color: #3b82f6; /* blue-500 */
  border-radius: 0 9999px 9999px 0;
  transition: transform 250ms ease;
}
</style>
