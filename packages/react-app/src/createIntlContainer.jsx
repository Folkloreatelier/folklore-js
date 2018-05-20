import React, { Component } from 'react';
import { IntlProvider, injectIntl, addLocaleData } from 'react-intl';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';
import get from 'lodash/get';
import en from 'react-intl/locale-data/en';
import fr from 'react-intl/locale-data/fr';

addLocaleData([...en, ...fr]);

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function createIntlContainer(localeSelector, messagesSelector, opts) {
    const defaultSelectLocale = props => props.locale;
    const defaultSelectMessages = props => get(props.messages, props.locale, props.messages);
    const selectLocale = localeSelector || defaultSelectLocale;
    const selectMessages = messagesSelector || defaultSelectMessages;
    const options = {
        withRef: false,
        ...opts,
    };

    return (WrappedComponent) => {
        const RenderComponent = injectIntl(WrappedComponent);
        class IntlContainer extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the createIntlContainer() call.',
                );
                return this.wrappedInstance;
            }

            render() {
                const locale = selectLocale(this.props);
                const messages = selectMessages(this.props);
                const props = {
                    ...this.props,
                };

                if (options.withRef) {
                    props.ref = (c) => {
                        this.wrappedInstance = c;
                    };
                }

                return (
                    <IntlProvider locale={locale} messages={messages}>
                        <RenderComponent {...props} />
                    </IntlProvider>
                );
            }
        }

        IntlContainer.displayName = `IntlContainer(${getDisplayName(WrappedComponent)})`;
        IntlContainer.WrappedComponent = WrappedComponent;

        return hoistStatics(IntlContainer, WrappedComponent);
    };
}
