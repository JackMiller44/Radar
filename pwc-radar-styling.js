(function() {
	let template = document.createElement("template");
	template.innerHTML = `
		<form id="form">
			<fieldset>
				<legend>Custom Widget Text</legend>
				<table>
					<tr>
						<td>Text</td>
						<td><input id="backgroundColor" type="string"></td>
					</tr>
				</table>
			</fieldset>
		</form>
	`;

	class PWC_RadarStyling extends HTMLElement {
		constructor() {
			super();
			this._shadowRoot = this.attachShadow({mode: "open"});
			this._shadowRoot.appendChild(template.content.cloneNode(true));
			this._shadowRoot.getElementById("form").addEventListener("submit", this._submit.bind(this));
		}

		_submit(e) {
			e.preventDefault();
			this.dispatchEvent(new CustomEvent("propertiesChanged", {
					detail: {
						properties: {
							backgroundColor: this.backgroundColor
						}
					}
			}));
		}

		set backgroundColor(color) {
			this._shadowRoot.getElementById("backgroundColor").value = color;
		}

		get backgroundColor() {
			return this._shadowRoot.getElementById("backgroundColor").value;
		}
	}

customElements.define("pwc-radar-styling", PWC_RadarStyling);
})();