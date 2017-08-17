'use strict';

import Base from './base.js';

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        //auto render template file index_index.html
        return this.display();
    }

    corsAction() {
        return this.success({
            test: 1
        });
    }

    corsfileAction() {
        let file = this.file("pngfile");
        console.log(file);
        return this.success({
            test: 2
        });
    }
}