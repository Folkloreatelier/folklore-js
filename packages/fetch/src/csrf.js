import Cookies from 'js-cookie';

export const getXSRFToken = () => {
    const cookies = Cookies.get();
    return cookies['X-XSRF-TOKEN'] || null;
};

const getCsrfToken = (name) => {
    const metaName = name || 'csrf-token';
    const metas = [].slice.call(document.getElementsByTagName('meta'));
    return metas.reduce((val, meta) => (
        meta.getAttribute('name') === metaName ? meta.getAttribute('content') : val
    ), null);
};

export const getCSRFHeaders = (name) => {
    const XSRF = getXSRFToken();
    if (XSRF !== null) {
        return {
            'X-XSRF-TOKEN': XSRF,
        };
    }
    const CSRF = getCsrfToken(name);
    if (CSRF !== null) {
        return {
            'X-CSRF-TOKEN': CSRF,
        };
    }
    return null;
};