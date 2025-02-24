<template>
  <div class="p-6">
    <AppCard>
      <template #title>Base64 Encoder/Decoder</template>
      <template #description>Encode or decode your text using Base64</template>
      
      <Tabs v-model="activeTab" defaultValue="encode">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" class="mt-4 space-y-4">
          <textarea
            v-model="input"
            class="min-h-[100px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            :placeholder="activeTab === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'"
          />
          <BaseButton class="w-full" @click="handleProcess">
            {{ activeTab === 'encode' ? 'Encode' : 'Decode' }}
          </BaseButton>
        </TabsContent>

        <TabsContent value="decode" class="mt-4 space-y-4">
          <textarea
            v-model="input"
            class="min-h-[100px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            :placeholder="activeTab === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'"
          />
          <BaseButton class="w-full" @click="handleProcess">
            {{ activeTab === 'encode' ? 'Encode' : 'Decode' }}
          </BaseButton>
        </TabsContent>

        <div class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold">Result</h3>
            <div class="space-x-2">
              <BaseButton variant="outline" size="icon" @click="handleSwap">
                <ArrowDownUp class="h-4 w-4" />
              </BaseButton>
              <BaseButton variant="outline" size="icon" @click="handleCopy">
                <Copy class="h-4 w-4" />
              </BaseButton>
            </div>
          </div>
          <textarea
            v-model="output"
            readonly
            class="min-h-[100px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm"
          />
        </div>
      </Tabs>
    </AppCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowDownUp, Copy } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';
import AppCard from '@/components/ui/AppCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';  // Changed to BaseButton
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from 'radix-vue';

defineOptions({ name: 'Base64Tool' });

const input = ref('');
const output = ref('');
const activeTab = ref('encode');
const { toast } = useToast();

const handleProcess = () => {
  try {
    output.value = activeTab.value === 'encode' 
      ? btoa(input.value)
      : atob(input.value);
  } catch (error) {
    toast({
      title: 'Error',
      description: `Invalid input for ${activeTab.value}ing`,
      variant: 'destructive'
    });
  }
};

const handleCopy = async () => {
  if (!output.value) return;
  
  await navigator.clipboard.writeText(output.value);
  toast({
    title: 'Copied!',
    description: 'Output copied to clipboard'
  });
};

const handleSwap = () => {
  [input.value, output.value] = [output.value, input.value];
};
</script>
