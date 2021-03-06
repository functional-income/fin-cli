import React, { Component } from 'react'
import { CTAButton, Section } from 'react-saasify'

import { DialogManager } from '../../lib/DialogManager'

export class CTASection extends Component {
  render() {
    const { cta = 'Request Access' } = this.props

    return (
      <Section {...this.props}>
        <CTAButton onClick={this._onClickRequestAccess}>{cta}</CTAButton>
      </Section>
    )
  }

  _onClickRequestAccess = () => {
    DialogManager.isSignupDialogOpen = true
  }
}
