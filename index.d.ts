
declare const chromium: {
    readonly path: string;
    install(): Promise<void>;
};

export = chromium;
