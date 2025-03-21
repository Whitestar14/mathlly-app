<template>
  <main class="flex-grow flex">
    <div class="flex-grow flex-initial bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300">
      <div class="flex flex-col h-full p-4 gap-2 mx-auto">
        <calculator-display :input="input" :preview="preview" :error="error" :is-animating="isAnimating"
          :animated-result="animatedResult" :active-base="activeBase" :mode="mode" :display-values="displayValues"
          @toggle-history="toggleHistory" @base-change="handleBaseChange" />

        <calculator-buttons :mode="mode" :input-length="input.length" :max-length="maxInputLength"
          :active-base="activeBase" @button-click="handleButtonClick" @clear="handleClear" />
      </div>

    </div>
    <history-panel :mode="mode" :is-mobile="isMobile" :is-open="isHistoryOpen" @toggle-history="toggleHistory"
      @close-history="closeHistory" @select-item="selectHistoryItem" />

    <!-- Welcome Modal -->
    <welcome-modal :is-open="showWelcomeModal" @update:is-open="showWelcomeModal = $event" @close="closeWelcomeModal" />
  </main>
</template>

<script setup>
import { computed, watch, ref, nextTick, onMounted, provide } from "vue"
import { useTitle, useEventListener } from "@vueuse/core"
import { useHistory } from "@/composables/useHistory"
import { usePanel } from "@/composables/usePanel"
import { useCalculator } from "@/composables/useCalculator"
import { useKeyboard } from "@/composables/useKeyboard"
import { useInputValidation } from "@/composables/useValidation"
import HistoryPanel from "@/layouts/pages/calculators/main/HistoryPanel.vue"
import WelcomeModal from "@/layouts/modals/WelcomeModal.vue"
import CalculatorDisplay from "@/layouts/pages/calculators/main/CalculatorDisplay.vue"
import CalculatorButtons from "@/layouts/pages/calculators/main/CalculatorButtons.vue"
import { useSettingsStore } from "@/stores/settings"

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
})

useTitle(computed(() => `${props.mode} Calculator - Mathlly`))

const { isValidForBase } = useInputValidation()

const {
  calculator,
  createCalculator,
  state,
  updateState,
  updateDisplayValues,
  setActiveBase,
  setAnimation,
  clearState,
  updateDisplayState,
} = useCalculator(props.mode, props.settings)

provide(
  "calculator",
  computed(() => calculator.value)
)

const input = computed(() => state.value.input)
const error = computed(() => state.value.error)
const isAnimating = computed(() => state.value.isAnimating)
const animatedResult = computed(() => state.value.animatedResult)
const activeBase = computed(() => state.value.activeBase)
const displayValues = computed(() => state.value.displayValues)
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH)

const preview = computed(() => {
  if (props.mode === "Programmer") {
    try {
      const result = calculator.value.evaluateExpression(
        input.value,
        activeBase.value
      )
      return calculator.value.formatResult(result, activeBase.value)
    } catch (err) {
      return ""
    }
  } else {
    try {
      const result = calculator.value.evaluateExpression(input.value)
      return calculator.value.formatResult(result)
    } catch (err) {
      return ""
    }
  }
})

const currentInput = ref("0")
const showWelcomeModal = ref(localStorage.getItem("mathlly-welcome-shown") !== "true")
const { addToHistory } = useHistory()
const { isOpen: isHistoryOpen, toggle: toggleHistory, close: closeHistory, handleResize } = usePanel('history-panel', props.isMobile)

watch(
  () => props.isMobile,
  (newIsMobile) => {
    handleResize(newIsMobile);
  }
);

const handleButtonClick = (btn) => {
  try {
    const result = calculator.value.handleButtonClick(btn)

    updateState({
      input: result.input,
      error: result.error || "",
    })

    if (btn === "=" && props.mode === "Programmer") {
      if (result.displayValues) {
        updateDisplayValues(result.displayValues)
        setAnimation(result.result)
      }
    } else if (props.mode === "Programmer") {
      nextTick(() => updateDisplayState())
    }

    if (btn === "=" && props.mode !== "Programmer" && result.result) {
      addToHistory(result.expression, result.result)
      setAnimation(result.result)
    }
  } catch (err) {
    console.error("Calculator operation error:", err)
    updateState({
      input: "Error",
      error: "Operation failed",
    })
  }
}

const handleClear = () => {
  const result = calculator.value.handleButtonClick("AC")
  updateState({
    input: result.input,
    error: "",
  })

  if (props.mode === "Programmer") {
    updateDisplayState()
  }
}

const handleBaseChange = (newBase) => {
  if (props.mode === "Programmer") {
    const result = calculator.value.handleBaseChange(newBase)
    nextTick(() => {
      setActiveBase(newBase)
      updateState({
        input: result.input,
        error: result.error || "",
        displayValues: result.displayValues,
      })
    })
  }
}

const { setContext, clearContext } = useKeyboard("calculator", {
  clear: () => handleButtonClick("AC"),
  calculate: () => handleButtonClick("="),
  backspace: () => handleButtonClick("backspace"),
  input: (value) => {
    if (props.mode === "Programmer") {
      if (isValidForBase(value, activeBase.value)) {
        handleButtonClick(value)
      }
    } else {
      handleButtonClick(value)
    }
  },
  // Replace setBase with a direct call to handleBaseChange
  setBase: (base) => {
    if (props.mode === "Programmer") {
      handleBaseChange(base)
    }
  },
})

// Add keyboard shortcuts for base changes
const handleKeyboardShortcuts = (e) => {
  if (props.mode !== "Programmer") return

  const shortcuts = {
    "ctrl+1": () => handleBaseChange("DEC"),
    "ctrl+2": () => handleBaseChange("HEX"),
    "ctrl+3": () => handleBaseChange("OCT"),
    "ctrl+4": () => handleBaseChange("BIN"),
  }

  const combo = [
    e.ctrlKey && "ctrl",
    e.shiftKey && "shift",
    e.altKey && "alt",
    e.key,
  ]
    .filter(Boolean)
    .join("+")

  if (shortcuts[combo]) {
    e.preventDefault()
    shortcuts[combo]()
  }
}

useEventListener("keydown", handleKeyboardShortcuts)
const settingsStore = useSettingsStore()

onMounted(() => {
  (async function() {await settingsStore.loadSettings()})();
})

watch(
  () => props.mode,
  (newMode) => {
    if (!newMode) return // Skip if mode is not set
    clearState()
    calculator.value = createCalculator(newMode)

    if (newMode === "Programmer") {
      setActiveBase("DEC")
      setContext("programmer")
    } else {
      clearContext("programmer")
    }
  },
  { immediate: true }
)

watch(
  currentInput,
  (newValue) => {
    if (newValue !== input.value && newValue !== "Error") {
      updateState({
        input: newValue,
        error: "",
      })
      calculator.value.input = newValue
      calculator.value.currentExpression = ""
      calculator.value.error = ""

      if (props.mode === "Programmer") {
        updateDisplayState()
      }
    }
  },
  { immediate: true }
)

watch(
  () => input.value,
  (newInput) => {
    if (props.mode === "Programmer" && newInput !== "Error") {
      nextTick(() => {
        try {
          const updatedDisplayValues =
            calculator.value.updateDisplayValues(newInput)
          updateDisplayValues(updatedDisplayValues)
        } catch (error) {
          console.error("Error updating display values:", error)
        }
      })
    }
  },
  { deep: true }
)

const selectHistoryItem = ({ expression }) => {
  if (props.mode === "Programmer") return

  updateState({ input: expression, error: "" })
  calculator.value.input = expression
  calculator.value.currentExpression = ""
  currentInput.value = expression
}

const closeWelcomeModal = () => {
  showWelcomeModal.value = false
}
</script>
