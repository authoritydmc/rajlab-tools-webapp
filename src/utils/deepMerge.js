// utils/deepMerge.js

export const deepMerge = (target, source) => {
    // Iterate over all keys in the source object
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            // If the value is an object, recurse
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else {
                // Otherwise, directly assign the value
                target[key] = source[key];
            }
        }
    }
    return target;
};
