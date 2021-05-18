import SelectionUtils from './SelectionUtils'
import css from './LinkWithTarget.css'

export default class LinkWithTarget {
  ENTER_KEY = 13

  constructor ({ config, api }) {
    this.toolbar = api.toolbar
    this.inlineToolbar = api.inlineToolbar
    this.tooltip = api.tooltip
    this.i18n = api.i18n
    this.config = config
    this.selection = new SelectionUtils()

    this.commandLink = 'createLink'
    this.commandUnlink = 'unlink'

    this.CSS = {
      wrapper: 'ce-inline-tool-targetlink-wrapper',
      wrapperShowed: 'ce-inline-tool-targetlink-wrapper--showed',
      button: 'ce-inline-tool',
      buttonActive: 'ce-inline-tool--active',
      buttonModifier: 'ce-inline-tool--link',
      buttonUnlink: 'ce-inline-tool--unlink',
      input: 'ce-inline-tool-targetlink--input',
      label: 'ce-inline-tool-targetlink--label',
      checkbox: 'ce-inline-tool-targetlink--checkbox',
      buttonSave: 'ce-inline-tool-targetlink--button'
    }

    this.nodes = {
      wrapper: null,
      input: null,
      checkbox: null,
      buttonSave: null
    }

    this.inputOpened = false
  }

  render () {
    this.nodes.button = document.createElement('button')
    this.nodes.button.type = 'button'
    this.nodes.button.classList.add(this.CSS.button, this.CSS.buttonModifier)
    this.nodes.button.appendChild(this.iconSvg('link', 14, 10))
    this.nodes.button.appendChild(this.iconSvg('unlink', 15, 11))
    return this.nodes.button
  }

  renderActions () {
    this.nodes.wrapper = document.createElement('div')
    this.nodes.wrapper.classList.add(this.CSS.wrapper)

    // CheckBox
    const checkboxLabel = document.createElement('label')
    const checkboxText = document.createElement('span')

    checkboxLabel.classList.add(this.CSS.label)
    checkboxText.innerHTML = this.i18n.t('Open in new window')
    this.nodes.checkbox = document.createElement('input')
    this.nodes.checkbox.setAttribute('type', 'checkbox')
    this.nodes.checkbox.classList.add(this.CSS.checkbox)

    checkboxLabel.appendChild(this.nodes.checkbox)
    checkboxLabel.appendChild(checkboxText)

    // Input
    this.nodes.input = document.createElement('input')
    this.nodes.input.placeholder = this.i18n.t('Add a link')
    this.nodes.input.classList.add(this.CSS.input)
    this.nodes.input.addEventListener('keydown', (event) => {
      if (event.keyCode === this.ENTER_KEY) {
        this.savePressed(event)
      }
    })

    // Button
    this.nodes.buttonSave = document.createElement('button')
    this.nodes.buttonSave.type = 'button'
    this.nodes.buttonSave.classList.add(this.CSS.buttonSave)
    this.nodes.buttonSave.innerHTML = this.i18n.t('Save')
    this.nodes.buttonSave.addEventListener('click', (event) => {
      this.savePressed(event)
    })

    // Append
    this.nodes.wrapper.appendChild(this.nodes.input)
    this.nodes.wrapper.appendChild(checkboxLabel)
    this.nodes.wrapper.appendChild(this.nodes.buttonSave)

    return this.nodes.wrapper
  }

  surround (range) {
    if (range) {
      if (!this.inputOpened) {
        this.selection.setFakeBackground()
        this.selection.save()
      } else {
        this.selection.restore()
        this.selection.removeFakeBackground()
      }
      const parentAnchor = this.selection.findParentTag('A')
      if (parentAnchor) {
        this.selection.expandToTag(parentAnchor)
        this.unlink()
        this.closeActions()
        this.checkState()
        this.toolbar.close()
        return
      }
    }
    this.toggleActions()
  }

  get shortcut () {
    return this.config.shortcut || 'CMD+L'
  }

  get title () {
    return 'Hyperlink'
  }

  static get isInline () {
    return true
  }

  static get sanitize () {
    return {
      a: {
        href: true,
        target: true
      }
    }
  }

  checkState (selection = null) {
    const anchorTag = this.selection.findParentTag('A')
    if (anchorTag) {
      this.nodes.button.classList.add(this.CSS.buttonUnlink)
      this.nodes.button.classList.add(this.CSS.buttonActive)
      this.openActions()
      const hrefAttr = anchorTag.getAttribute('href')
      const targetAttr = anchorTag.getAttribute('target')
      this.nodes.input.value = hrefAttr || ''
      this.nodes.checkbox.checked = targetAttr === '_blank'
      this.selection.save()
    } else {
      this.nodes.button.classList.remove(this.CSS.buttonUnlink)
      this.nodes.button.classList.remove(this.CSS.buttonActive)
    }
    return !!anchorTag
  }

  clear () {
    this.closeActions()
  }

  toggleActions () {
    if (!this.inputOpened) {
      this.openActions(true)
    } else {
      this.closeActions(false)
    }
  }

  openActions (needFocus = false) {
    this.nodes.wrapper.classList.add(this.CSS.wrapperShowed)
    if (needFocus) {
      this.nodes.input.focus()
    }
    this.inputOpened = true
  }

  closeActions (clearSavedSelection = true) {
    if (this.selection.isFakeBackgroundEnabled) {
      const currentSelection = new SelectionUtils()
      currentSelection.save()
      this.selection.restore()
      this.selection.removeFakeBackground()
      currentSelection.restore()
    }
    this.nodes.wrapper.classList.remove(this.CSS.wrapperShowed)
    this.nodes.input.value = ''
    this.nodes.checkbox.checked = false

    if (clearSavedSelection) {
      this.selection.clearSaved()
    }
    this.inputOpened = false
  }

  savePressed (event) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    let value = this.nodes.input.value || ''
    const isTargetBlank = this.nodes.checkbox.checked

    if (!value.trim()) {
      this.selection.restore()
      this.unlink()
      event.preventDefault()
      this.closeActions()
    }

    value = this.prepareLink(value)

    this.selection.restore()
    this.selection.removeFakeBackground()

    this.insertLink(value, isTargetBlank)

    this.selection.collapseToEnd()
    this.inlineToolbar.close()
  }

  prepareLink (link) {
    link = link.trim()
    return link
  }

  insertLink (link, isTargetBlank = false) {
    let anchorTag = this.selection.findParentTag('A')
    if (anchorTag) {
      this.selection.expandToTag(anchorTag)
    } else {
      document.execCommand(this.commandLink, false, link)
      anchorTag = this.selection.findParentTag('A')
    }
    if (anchorTag) {
      anchorTag.target = isTargetBlank ? '_blank' : '_self'
      anchorTag.href = link
    }
  }

  unlink () {
    document.execCommand(this.commandUnlink)
  }

  iconSvg (name, width = 14, height = 14) {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    icon.classList.add('icon', 'icon--' + name)
    icon.setAttribute('width', width + 'px')
    icon.setAttribute('height', height + 'px')
    icon.innerHTML = `<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${name}"></use>`
    return icon
  }
}
