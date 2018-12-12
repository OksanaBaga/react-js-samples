import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { computed, action, observable, runInAction } from 'mobx';
import { Row, Col, Button } from 'react-bootstrap';

import { injectIntl, withExtendedRouter } from 'src/utils';
import consts from 'src/lib/consts';
import { FormRadioField, FormCheckboxField } from 'src/app/components';

const { settings } = consts;

@inject('ui')
@inject('auth')
@inject('user')
@withExtendedRouter
@injectIntl
@observer
class PrivacySettings extends Component {
  @action
  componentWillMount() {
    const { auth: { user: { settings: userSettings } } } = this.props;
    this.settings = { ...userSettings };
  }

  onSave = async () => {
    const { user: userStore, auth, ui, history } = this.props;
    try {
      const updatedUser = await userStore.updateSettings(this.settings);
      runInAction(() => {
        auth.user = { ...auth.user, ...updatedUser };
        history.push('/profile');
      });
    } catch (error) {
      ui.setLastError(error);
    }
  };

  @computed
  get privacySettings() {
    const { auth: { user } } = this.props;
    return Object.keys(user.settings).map(key => (
      settings[key] &&
        <Row key={key} className="form-group">
          <Col md={4} className="bold pb-1">{this.localise(`${key}.title`)}</Col>
          <Col md={8}>
            {
              settings[key].map(item => (
                <div key={item.title} className="mb-1">
                  {
                    Object.prototype.hasOwnProperty.call(item, 'value')
                      ? <FormRadioField
                          name={key}
                          checked={this.settings[key] === item.value}
                          value={item.value}
                          onChange={this.handleChange(key, item.isBool)}
                        >
                          <div>{this.localise(item.title)}</div>
                          {
                            item.description &&
                            <div className="grey">{this.localise(item.description)}</div>
                          }
                        </FormRadioField>
                      : <FormCheckboxField
                          checked={this.settings[key][item.key]}
                          onChange={this.handleChange(key, true, item.key)}
                        >
                          {this.localise(item.title)}
                        </FormCheckboxField>
                  }
                </div>
              ))
          }
          </Col>
        </Row>
    ));
  }

  @action
  handleChange = (fieldName, isBool, key) => (e) => {
    const { value } = e.target;
    if (isBool && key) {
      this.settings[fieldName][key] = !this.settings[fieldName][key];
    } else {
      this.settings[fieldName] = isBool ? !this.settings[fieldName] : parseInt(value, 10);
    }
  };

  localise = (key) => {
    const { intl } = this.props;
    return intl.formatMessage({ id: `user.profile.settings.${key}` });
  };

  @observable settings = {};

  render() {
    return (
      <div className="privacy-settings">
        <h2 className="title">{this.localise('navigation.privacy')}</h2>
        <div className="privacy-settings">{this.privacySettings}</div>
        <Row>
          <Col sm={4} />
          <Col sm={8}>
            <Button
              className="sn-btn btn-md btn-bordered-red full-width mt-2"
              onClick={this.onSave}
            >
              {this.localise('save')}
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default PrivacySettings;
