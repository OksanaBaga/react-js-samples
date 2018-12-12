import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Row, Col, Button, ControlLabel } from 'react-bootstrap';

import { injectIntl, withExtendedRouter } from 'src/utils';
import { ModalDialog } from 'src/app/components';

@inject('ui')
@inject('auth')
@inject('user')
@withExtendedRouter
@injectIntl
@observer
class RemoveProfileForm extends Component {
  onRemove = async (submit) => {
    if (!submit) {
      return;
    }
    const { user: userStore, auth, ui } = this.props;
    try {
      const updatedUser = await userStore.toggleRemove();
      auth.updateUser(updatedUser);
    } catch (error) {
      ui.setLastError(error);
    }
  };

  showConfirmationDialog = () => {
    const { ui, intl, auth: { user: { removedAt } } } = this.props;
    ui.showConfirmationDialog({
      handler: this.onRemove,
      custom: <ModalDialog
        showCancelButton
        header={intl.formatMessage({ id: 'user.profile.settings.removeProfile.title' })}
        body={
          <div>
            {
              !removedAt &&
              <p>{intl.formatMessage({ id: 'user.profile.settings.removeProfile.message' })}</p>
            }
            <p>{intl.formatMessage({ id: `user.profile.settings.removeProfile.${removedAt ? 'canselRequesMessage' : 'confirmMessage'}` })}</p>
          </div>}
        confirmButtonText={removedAt && intl.formatMessage({ id: 'common.texts.yes' })}
        cancelButtonText={removedAt && intl.formatMessage({ id: 'common.texts.no' })}
      />,
    });
  };

  render() {
    const { intl, auth: { user: { removedAt } } } = this.props;
    return (
      <div className="remove-profile">
        <h2 className="title">{intl.formatMessage({ id: 'user.profile.settings.removeProfile.title' })}</h2>
        <Row className="mt-2">
          <Col sm={4}>
            <ControlLabel>{intl.formatMessage({ id: 'user.profile.settings.removeProfile.label' })}</ControlLabel>
          </Col>
          <Col sm={8}>
            <Button
              className="sn-btn btn-md btn-red-fill full-width"
              onClick={this.showConfirmationDialog}
            >
              {
                intl.formatMessage({
                  id: `user.profile.settings.removeProfile.${removedAt ? 'cancelDeletionRequest' : 'deletionRequest'}`,
                })
              }
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default RemoveProfileForm;
