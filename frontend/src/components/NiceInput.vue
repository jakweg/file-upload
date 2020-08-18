<template>
    <div>
        <!--suppress HtmlFormInputWithoutLabel -->
        <input :autocomplete="noSuggestions ? 'off' : null" :disabled="disabled"
               :max="max" :min="min"
               :placeholder="placeholder" :readonly="readOnly"
               :type="type"
               @blur="$emit('blur', $event)"
               @input="$emit('input', $event.target.value)"
               v-model="value"
        >
    </div>
</template>

<script>
    export default {
        name: 'NiceInput',
        props: {
            type: String,
            placeholder: String,
            defaultValue: String,
            disabled: Boolean,
            readOnly: Boolean,
            noSuggestions: Boolean,
            min: Number,
            max: Number,
        },
        data() {
            return {
                value: this.defaultValue
            };
        },
        watch: {
            defaultValue(value) {
                this.value = value;
            }
        }
    };
</script>

<style scoped>
    div {
        transition: border-bottom-color .3s, box-shadow .3s, background-color .3s;
        border-top: 2px solid transparent;
        border-bottom: 2px solid transparent;
        text-align: center;
        position: relative;
        border-radius: 8px;
        box-shadow: 1px 1px 4px #00000099;
        margin: 4px;
        background: #ffffff11;
    }

    div:focus-within {
        background: #ffffff22;
        border-bottom-color: deeppink;
        box-shadow: 1px 1px 4px #000000dd;
    }

    input {
        box-sizing: border-box;
        padding: 0 2px;
        width: 100%;
        overflow: auto;
        text-align: center;
        background: none;
        border: none;
        font: inherit;
        font-size: .95em;
        font-weight: bolder;
        color: #eee;
    }

    input:focus {
        border: none;
        outline: none;
        color: #fff;
    }

    input[type='number'] {
        -moz-appearance: textfield;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
</style>
