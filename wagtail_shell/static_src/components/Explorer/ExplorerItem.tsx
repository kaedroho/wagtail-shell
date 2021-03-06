/* eslint-disable react/prop-types */

import React from 'react';

import Icon from '../common/Icon';
import Button from '../common/Button';
import PublicationStatus from '../common/PublicationStatus';
import { PageState } from './reducers/nodes';

const LOCALE_NAMES = new Map();

/* eslint-disable-next-line camelcase */
wagtailConfig.LOCALES.forEach(({ code, display_name }) => {
    LOCALE_NAMES.set(code, display_name);
});


// Hoist icons in the explorer item, as it is re-rendered many times.
const childrenIcon = (
    <Icon name="folder-inverse" className="icon--menuitem" />
);

interface ExplorerItemProps {
    item: PageState;
    onClick(): void;
    navigate(url: string): Promise<void>;
}

/**
 * One menu item in the page explorer, with different available actions
 * and information depending on the metadata of the page.
 */
const ExplorerItem: React.FunctionComponent<ExplorerItemProps> = ({ item, onClick, navigate }) => {
    const { id, admin_display_title: title, meta } = item;
    const hasChildren = meta.children.count > 0;
    const isPublished = meta.status.live && !meta.status.has_unpublished_changes;
    const localeName = meta.parent?.id === 1 && meta.locale && (LOCALE_NAMES.get(meta.locale) || meta.locale);

    return (
        <div className="c-explorer__item">
            <Button href={`${wagtailConfig.ADMIN_URLS.PAGES}${id}/`} className="c-explorer__item__link" navigate={navigate}>
                {hasChildren ? childrenIcon : null}

                <h3 className="c-explorer__item__title">
                    {title}
                </h3>

                {(!isPublished || localeName) &&
                    <span className="c-explorer__meta">
                        {localeName && <span className="o-pill c-status">{localeName}</span>}
                        {!isPublished && <PublicationStatus status={meta.status} />}
                    </span>
                }
            </Button>
            <Button
                href={`${wagtailConfig.ADMIN_URLS.PAGES}${id}/edit/`}
                className="c-explorer__item__action c-explorer__item__action--small"
                navigate={navigate}
            >
                <Icon name="edit" title={gettext("Edit '{title}").replace('{title}', title || '')} className="icon--item-action" />
            </Button>
            {hasChildren ? (
                <Button
                    className="c-explorer__item__action"
                    onClick={onClick}
                    href={`${wagtailConfig.ADMIN_URLS.PAGES}${id}/`}
                >
                    <Icon
                        name="arrow-right"
                        title={gettext("View child pages of '{title}'").replace('{title}', title || '')}
                        className="icon--item-action"
                    />
                </Button>
            ) : null}
        </div>
    );
};

export default ExplorerItem;
