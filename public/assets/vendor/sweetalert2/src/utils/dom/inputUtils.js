import { showLoading } from 'public/assets/vendor/sweetalert2/src/staticMethods/showLoading.js'
import { swalClasses } from 'public/assets/vendor/sweetalert2/src/utils/classes.js'
import { asPromise, error, hasToPromiseFn, isPromise } from 'public/assets/vendor/sweetalert2/src/utils/utils.js'
import { getDirectChildByClass } from 'public/assets/vendor/sweetalert2/src/utils/dom/domUtils.js'
import * as dom from 'public/assets/vendor/sweetalert2/src/utils/dom/index'

/**
 * @param {SweetAlert} instance
 * @param {SweetAlertOptions} params
 */
export const handleInputOptionsAndValue = (instance, params) => {
  if (params.input === 'select' || params.input === 'radio') {
    handleInputOptions(instance, params)
  } else if (
    ['text', 'email', 'number', 'tel', 'textarea'].some((i) => i === params.input) &&
    (hasToPromiseFn(params.inputValue) || isPromise(params.inputValue))
  ) {
    showLoading(dom.getConfirmButton())
    handleInputValue(instance, params)
  }
}

/**
 * @param {SweetAlert} instance
 * @param {SweetAlertOptions} innerParams
 * @returns {SweetAlertInputValue}
 */
export const getInputValue = (instance, innerParams) => {
  const input = instance.getInput()
  if (!input) {
    return null
  }
  switch (innerParams.input) {
    case 'checkbox':
      return getCheckboxValue(input)
    case 'radio':
      return getRadioValue(input)
    case 'file':
      return getFileValue(input)
    default:
      return innerParams.inputAutoTrim ? input.value.trim() : input.value
  }
}

/**
 * @param {HTMLInputElement} input
 * @returns {number}
 */
const getCheckboxValue = (input) => (input.checked ? 1 : 0)

/**
 * @param {HTMLInputElement} input
 * @returns {string | null}
 */
const getRadioValue = (input) => (input.checked ? input.value : null)

/**
 * @param {HTMLInputElement} input
 * @returns {FileList | File | null}
 */
const getFileValue = (input) =>
  input.files && input.files.length ? (input.getAttribute('multiple') !== null ? input.files : input.files[0]) : null

/**
 * @param {SweetAlert} instance
 * @param {SweetAlertOptions} params
 */
const handleInputOptions = (instance, params) => {
  const popup = dom.getPopup()
  if (!popup) {
    return
  }
  /**
   * @param {Record<string, any>} inputOptions
   */
  const processInputOptions = (inputOptions) => {
    if (params.input === 'select') {
      populateSelectOptions(popup, formatInputOptions(inputOptions), params)
    } else if (params.input === 'radio') {
      populateRadioOptions(popup, formatInputOptions(inputOptions), params)
    }
  }
  if (hasToPromiseFn(params.inputOptions) || isPromise(params.inputOptions)) {
    showLoading(dom.getConfirmButton())
    asPromise(params.inputOptions).then((inputOptions) => {
      instance.hideLoading()
      processInputOptions(inputOptions)
    })
  } else if (typeof params.inputOptions === 'object') {
    processInputOptions(params.inputOptions)
  } else {
    error(`Unexpected type of inputOptions! Expected object, Map or Promise, got ${typeof params.inputOptions}`)
  }
}

/**
 * @param {SweetAlert} instance
 * @param {SweetAlertOptions} params
 */
const handleInputValue = (instance, params) => {
  const input = instance.getInput()
  if (!input) {
    return
  }
  dom.hide(input)
  asPromise(params.inputValue)
    .then((inputValue) => {
      input.value = params.input === 'number' ? `${parseFloat(inputValue) || 0}` : `${inputValue}`
      dom.show(input)
      input.focus()
      instance.hideLoading()
    })
    .catch((err) => {
      error(`Error in inputValue promise: ${err}`)
      input.value = ''
      dom.show(input)
      input.focus()
      instance.hideLoading()
    })
}

/**
 * @param {HTMLElement} popup
 * @param {InputOptionFlattened[]} inputOptions
 * @param {SweetAlertOptions} params
 */
function populateSelectOptions(popup, inputOptions, params) {
  const select = getDirectChildByClass(popup, swalClasses.select)
  if (!select) {
    return
  }
  /**
   * @param {HTMLElement} parent
   * @param {string} optionLabel
   * @param {string} optionValue
   */
  const renderOption = (parent, optionLabel, optionValue) => {
    const option = document.createElement('option')
    option.value = optionValue
    dom.setInnerHtml(option, optionLabel)
    option.selected = isSelected(optionValue, params.inputValue)
    parent.appendChild(option)
  }
  inputOptions.forEach((inputOption) => {
    const optionValue = inputOption[0]
    const optionLabel = inputOption[1]
    // <optgroup> spec:
    // https://www.w3.org/TR/html401/interact/forms.html#h-17.6
    // "...all OPTGROUP elements must be specified directly within a SELECT element (i.e., groups may not be nested)..."
    // check whether this is a <optgroup>
    if (Array.isArray(optionLabel)) {
      // if it is an array, then it is an <optgroup>
      const optgroup = document.createElement('optgroup')
      optgroup.label = optionValue
      optgroup.disabled = false // not configurable for now
      select.appendChild(optgroup)
      optionLabel.forEach((o) => renderOption(optgroup, o[1], o[0]))
    } else {
      // case of <option>
      renderOption(select, optionLabel, optionValue)
    }
  })
  select.focus()
}

/**
 * @param {HTMLElement} popup
 * @param {InputOptionFlattened[]} inputOptions
 * @param {SweetAlertOptions} params
 */
function populateRadioOptions(popup, inputOptions, params) {
  const radio = getDirectChildByClass(popup, swalClasses.radio)
  if (!radio) {
    return
  }
  inputOptions.forEach((inputOption) => {
    const radioValue = inputOption[0]
    const radioLabel = inputOption[1]
    const radioInput = document.createElement('input')
    const radioLabelElement = document.createElement('label')
    radioInput.type = 'radio'
    radioInput.name = swalClasses.radio
    radioInput.value = radioValue
    if (isSelected(radioValue, params.inputValue)) {
      radioInput.checked = true
    }
    const label = document.createElement('span')
    dom.setInnerHtml(label, radioLabel)
    label.className = swalClasses.label
    radioLabelElement.appendChild(radioInput)
    radioLabelElement.appendChild(label)
    radio.appendChild(radioLabelElement)
  })
  const radios = radio.querySelectorAll('input')
  if (radios.length) {
    radios[0].focus()
  }
}

/**
 * Converts `inputOptions` into an array of `[value, label]`s
 *
 * @param {Record<string, any>} inputOptions
 * @typedef {string[]} InputOptionFlattened
 * @returns {InputOptionFlattened[]}
 */
const formatInputOptions = (inputOptions) => {
  /** @type {InputOptionFlattened[]} */
  const result = []
  if (inputOptions instanceof Map) {
    inputOptions.forEach((value, key) => {
      let valueFormatted = value
      if (typeof valueFormatted === 'object') {
        // case of <optgroup>
        valueFormatted = formatInputOptions(valueFormatted)
      }
      result.push([key, valueFormatted])
    })
  } else {
    Object.keys(inputOptions).forEach((key) => {
      let valueFormatted = inputOptions[key]
      if (typeof valueFormatted === 'object') {
        // case of <optgroup>
        valueFormatted = formatInputOptions(valueFormatted)
      }
      result.push([key, valueFormatted])
    })
  }
  return result
}

/**
 * @param {string} optionValue
 * @param {SweetAlertInputValue} inputValue
 * @returns {boolean}
 */
const isSelected = (optionValue, inputValue) => {
  return !!inputValue && inputValue.toString() === optionValue.toString()
}
