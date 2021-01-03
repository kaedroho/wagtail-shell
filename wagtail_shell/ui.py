class LinkAction:
    def __init__(self, label, url, *, icon=None):
        self.label = label
        self.url = url
        self.icon = icon

    def as_json(self):
        return {
            'label': self.label,
            'url': self.url,
            'icon': self.icon,
        }

    @classmethod
    def extract_from_legacy_html(cls, soup):
        a_tags = soup.findAll('a')
        if len(a_tags) != 1:
            return

        a_tag = a_tags[0]

        return cls(a_tag.text, a_tag.attrs['href'])


class Header:
    def __init__(
        self, *,
        title,
        icon=None,
        has_search_form=False,
        actions=None
    ):
        self.title = title
        self.icon = icon
        self.has_search_form = has_search_form
        self.actions = actions or []

    def as_json(self):
        return {
            'title': self.title,
            'icon': self.icon,
            'has_search_form': self.has_search_form,
            'actions': [action.as_json() for action in self.actions],
        }

    @classmethod
    def extract_from_legacy_html(cls, soup):
        header_tags = soup.findAll('header')
        if len(header_tags) != 1:
            return

        header = header_tags[0]

        # Extract title
        title_tag = header.find('h1')
        title = title_tag.text.strip()
        title_tag.replaceWith('')

        # Extract search form
        has_search_form = False
        if 'hasform' in header.attrs.get('class', ''):
            search_form_tag = header.find('form')
            if 'search-form' not in search_form_tag.attrs.get('class', ''):
                # No idea what this form is
                return

            search_form_tag.replaceWith('')
            has_search_form = True

        # Extract actions
        actions = []
        for action_tag in soup.select('div.actionbutton'):
            action = LinkAction.extract_from_legacy_html(action_tag)

            if action:
                actions.append(action)
                action_tag.replaceWith('')

        # if there's no unparsed content, return a Header
        if len(header.get_text(strip=True)) == 0:
            header.replaceWith('')
            return cls(title=title, has_search_form=has_search_form, actions=actions)
