import * as domUtils from 'public/assets/vendor/sweetalert2/src/utils/dom/domUtils.js'
import * as dom from 'public/assets/vendor/sweetalert2/src/utils/dom'

export {
  getContainer,
  getPopup,
  getTitle,
  getHtmlContainer,
  getImage,
  getIcon,
  getIconContent,
  getInputLabel,
  getCloseButton,
  getActions,
  getConfirmButton,
  getDenyButton,
  getCancelButton,
  getLoader,
  getFooter,
  getTimerProgressBar,
  getFocusableElements,
  getValidationMessage,
  getProgressSteps,
  isLoading,
} from 'public/assets/vendor/sweetalert2/src/utils/dom'

/*
 * Global function to determine if SweetAlert2 popup is shown
 */
export const isVisible = () => {
  return domUtils.isVisible(dom.getPopup())
}

/*
 * Global function to click 'Confirm' button
 */
export const clickConfirm = () => dom.getConfirmButton()?.click()

/*
 * Global function to click 'Deny' button
 */
export const clickDeny = () => dom.getDenyButton()?.click()

/*
 * Global function to click 'Cancel' button
 */
export const clickCancel = () => dom.getCancelButton()?.click()
