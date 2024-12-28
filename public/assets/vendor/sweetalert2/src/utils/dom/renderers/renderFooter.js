import * as dom from 'public/assets/vendor/sweetalert2/src/utils/dom/index'

/**
 * @param {SweetAlert} instance
 * @param {SweetAlertOptions} params
 */
export const renderFooter = (instance, params) => {
  const footer = dom.getFooter()
  if (!footer) {
    return
  }

  dom.showWhenInnerHtmlPresent(footer)

  dom.toggle(footer, params.footer, 'block')

  if (params.footer) {
    dom.parseHtmlToContainer(params.footer, footer)
  }

  // Custom class
  dom.applyCustomClass(footer, params, 'footer')
}
