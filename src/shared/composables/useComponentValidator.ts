import { ref, computed, onMounted } from 'vue'
import { useGlobalAlerts } from './useGlobalAlerts'

/**
 * useComponentValidator - Sistema de validação de componentes
 * 
 * Valida props obrigatórias, dispara alerts quando há erros,
 * registra logs para debug em modo desenvolvimento
 * 
 * Uso:
 * const { isValid, validationErrors } = useComponentValidator('ComponentName', {
 *   propName: propValue,
 *   ...
 * })
 */

export interface ValidationRule {
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'
    oneOf?: any[]
    custom?: (value: any) => boolean | string
}

export interface ValidationRules {
    [key: string]: ValidationRule
}

export interface ComponentValidatorOptions {
    /** Se deve mostrar alert ao usuário quando houver erro */
    showAlertOnError?: boolean
    /** Se deve logar erros no console */
    logErrors?: boolean
    /** Janela para mostrar o alert (opcional) */
    windowId?: string
}

export function useComponentValidator(
    componentName: string,
    props: Record<string, any>,
    rules?: ValidationRules,
    options: ComponentValidatorOptions = {}
) {
    const {
        showAlertOnError = false, // Desabilitado por padrão para não poluir
        logErrors = true,
        windowId = 'main-' + Date.now()
    } = options

    const validationErrors = ref<string[]>([])
    const isValid = computed(() => validationErrors.value.length === 0)

    // Validação básica de tipos conhecidos
    const builtInRules: ValidationRules = {
        variant: {
            oneOf: ['primary', 'secondary', 'danger', 'success', 'warning', 'ghost', 'default']
        },
        size: {
            oneOf: ['sm', 'md', 'lg']
        },
        type: {
            oneOf: ['button', 'submit', 'reset']
        }
    }

    function validateProp(propName: string, propValue: any, rule: ValidationRule): string | null {
        // Required check
        if (rule.required && (propValue === undefined || propValue === null)) {
            return `Prop "${propName}" is required but was not provided`
        }

        // Skip validation if value is undefined/null and not required
        if (propValue === undefined || propValue === null) {
            return null
        }

        // Type check
        if (rule.type) {
            const actualType = Array.isArray(propValue) ? 'array' : typeof propValue
            if (actualType !== rule.type) {
                return `Prop "${propName}" expected type "${rule.type}" but got "${actualType}"`
            }
        }

        // OneOf check (enum validation)
        if (rule.oneOf && !rule.oneOf.includes(propValue)) {
            return `Prop "${propName}" must be one of: [${rule.oneOf.join(', ')}], but got "${propValue}"`
        }

        // Custom validation
        if (rule.custom) {
            const result = rule.custom(propValue)
            if (result !== true) {
                return typeof result === 'string' ? result : `Prop "${propName}" failed custom validation`
            }
        }

        return null
    }

    function validate() {
        validationErrors.value = []

        // Merge built-in rules with custom rules
        const allRules = { ...builtInRules, ...rules }

        // Validate each prop that has a rule
        for (const [propName, rule] of Object.entries(allRules)) {
            const propValue = props[propName]
            const error = validateProp(propName, propValue, rule)

            if (error) {
                validationErrors.value.push(error)
            }
        }

        // Handle validation failures
        if (!isValid.value) {
            handleValidationFailure()
        }

        return isValid.value
    }

    function handleValidationFailure() {
        const errorMessage = `[${componentName}] Validation failed:\n${validationErrors.value.join('\n')}`

        // Log to console in development
        if (logErrors && import.meta.env.DEV) {
            console.error(errorMessage)
            console.group(`${componentName} Validation Details`)
            console.table(props)
            console.error('Errors:', validationErrors.value)
            console.groupEnd()
        }

        // Show alert to user if enabled
        if (showAlertOnError) {
            try {
                const alerts = useGlobalAlerts(windowId)
                alerts.showError(
                    `Component Error: ${componentName}`,
                    `This component failed to render properly due to invalid configuration:\n\n${validationErrors.value.join('\n\n')}\n\nPlease check the console for more details.`
                )
            } catch (error) {
                console.error('[useComponentValidator] Failed to show alert:', error)
            }
        }
    }

    // Validate on mount
    onMounted(() => {
        validate()
    })

    // Public API
    return {
        /** Se o componente é válido */
        isValid,
        /** Lista de erros de validação */
        validationErrors,
        /** Re-valida o componente manualmente */
        validate
    }
}

/**
 * Helper para validação de slots
 */
export function useSlotValidator(componentName: string, slots: any, requiredSlots: string[]) {
    const missingSlots = requiredSlots.filter(slotName => !slots[slotName])

    if (missingSlots.length > 0) {
        console.error(
            `[${componentName}] Missing required slots:`,
            missingSlots.join(', ')
        )
        return false
    }

    return true
}

/**
 * Helper para registrar uso de componente (telemetria)
 */
export function useComponentTelemetry(componentName: string, props: Record<string, any>) {
    if (import.meta.env.DEV) {
        console.log(`[Component Used] ${componentName}`, props)
    }
}
