<template>
    <div class="panel-container" :class="{ mobile: isMobile }">
        <!-- Backdrop -->
        <Transition name="fade">
            <div v-if="isMobile && isOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden="true"
                @click="onClose" />
        </Transition>

        <!-- Desktop Panel -->
         <Transition name="slide-out">
        <div v-if="!isMobile" class="desktop-panel" :class="[
            'transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700',
        ]"
        :style="{ width: isOpen ? width : closedWidth }">
            <div class="panel-content absolute inset-y-0 right-0 bg-white dark:bg-gray-800 transition-opacity duration-300 max-h-[100vh]" :class="[
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none', mainClass
            ]">
                <div class="flex flex-col h-full">
                    <!-- Header -->
                    <div class="flex-shrink-0 h-14 px-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 class="text-base font-medium text-gray-800 dark:text-gray-200">
                            {{ title }}
                        </h2>
                        <Button v-if="isMobile" variant="ghost" size="icon" @click="onClose">
                            <XIcon class="h-4 w-4" />
                        </Button>
                    </div>
                    <!-- Main Content -->
                    <div class="flex-1 overflow-y-auto">
                        <slot></slot>
                    </div>
                    <!-- Footer -->
                    <div v-if="$slots.footer" class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 min-h-14">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>

            <!-- Toggle button (desktop only) -->
            <div v-if="showToggle">
                <Button v-tippy="{
                    content: isOpen ? 'Hide Panel' : 'Show Panel',
                    placement: 'left',
                }" variant="outline" size="icon" :class="[
                    'shadow-sm absolute left-0 bottom-0 -translate-y-1/3 pointer-events-auto',
                    !isOpen ? '-translate-x-1/2 left-1/2' : 'translate-x-1/4',
                ]" @click="onToggle">
                    <ChevronRightIcon class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300"
                        :class="{ 'rotate-180': isOpen }" />
                </Button>
            </div>
        </div>
        </Transition>

        <!-- Mobile Panel -->
        <Transition name="slide-up">
            <div v-if="isMobile && isOpen"
                class="fixed inset-x-0 bottom-0 z-50 rounded-t-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 max-h-[80vh] h-[600px]">
                <div class="panel-content h-full" :class="mainClass">
                     <!-- Header -->
                     <div class="flex-shrink-0 h-14 px-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 class="text-base font-medium text-gray-800 dark:text-gray-200">
                            {{ title }}
                        </h2>
                        <Button v-if="isMobile" variant="ghost" size="icon" @click="onClose">
                            <XIcon class="h-4 w-4" />
                        </Button>
                    </div>
                    <!-- Main Content -->
                    <div class="flex-1 overflow-y-auto">
                        <slot></slot>
                    </div>
                    <!-- Footer -->
                    <div v-if="$slots.footer" class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 min-h-14">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ChevronRightIcon, XIcon } from "lucide-vue-next"
import Button from "@/components/base/BaseButton.vue"

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    isMobile: { type: Boolean, default: false },
    showToggle: { type: Boolean, default: true},
    title: { type: String, default: "" },
    mainClass: { type: String, default: "" },
    width: { type: String, default: "18.5rem" },
    closedWidth: { type: String, default: "2.5rem" }
})

const emit = defineEmits(["update:isOpen"])

const onOpen = () => emit("update:isOpen", true);
const onClose = () => emit("update:isOpen", false)

const onToggle = () => {
    props.isOpen === true ? onClose() : onOpen();
}
</script>

<style scoped>
.panel-container {
    position: relative;
    z-index: 10;
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
}

.panel-container.mobile {
    display: contents;
}

.desktop-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.panel-content {
    display: flex;
    flex-direction: column;
    width: 100%;
}

/* Mobile panel animations */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}

/* Fade animations for backdrop */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
