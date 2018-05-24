export class Form {
    constructor(elements) {
        this.elements = elements
    }

    getValue() {
        let res = {}

        for(let i = 0; i < this.elements.length; i++) {
            let elm = this.elements[i]
            if(elm.validate() === false) {
                return false
            }

            if(elm.name != '') {
                res[elm.name] = elm.getValue()
            }
        }

        return res
    }
}

export class Element {
    value = null
    rules = []
    errors = []

    constructor(name, props, rules) {
        this.name = name
        this.props = props
        if(rules.isArray) {
            this.rules = rules
        }
    }

    setValue(value) {
        this.value = value
    }

    getValue() {
        return this.value
    }

    validate() {
        this.errors = []

        for (let i = 0; i <  this.rules.length; i++) {
            if(this.rules[i].check(this.value) === false) {
                this.errors.push(this.rules[i].msg)
            }
        }
        return this.errors.length === 0
    }
}

export class Rule {
    constructor(msg) {
        this.msg = msg
    }

    validate(val) {
        return true
    }
}

export class MinRule extends Rule {
    constructor(msg, length) {
        super(msg);
        this.length = length
    }

    validate(val) {
        val += ''
        if(typeof val !== 'string') {
            return false
        }

        return val.length > this.length
    }
}

export class MaxRule extends Rule {
    constructor(msg, length) {
        super(msg);
        this.length = length
    }

    validate(val) {
        val += ''
        if(typeof val !== 'string') {
            return false
        }

        return val.length <= this.length
    }
}

export class RequiredRule extends Rule {
    validate(val) {
        if(val === null) {
            return false
        }

        if(typeof val === 'string') {
            return val !== ''
        }
    }
}