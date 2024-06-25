export const refToDisplayString = (ref: string | undefined) => {
    if (ref === undefined) {
        return 'undefined';
    }
    return ref.replace(/^refs\/heads\//, '');
};
