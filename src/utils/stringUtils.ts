export const refToDisplayString = (ref: string | undefined) => {
    if (ref === undefined) {
        return 'undefined';
    }
    return ref.replace(/^refs\/heads\//, '');
};

export const removeTags = (str: string) => {
    if (!str) {
        return '';
    }

    return str.replace(/(<([^>]+)>)/gi, '');
};