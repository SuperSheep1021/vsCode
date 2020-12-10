"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const vscode_1=require("vscode"),Utilities_1=require("./Utilities"),functionsConfig=require("./data/functions.json"),ValuesConfig=require("./data/values.json"),keywordsConfig=require("./data/keywords.json"),IntellisenseConfig=require("./data/intellisense.json"),Builtin_1=require("./Builtin"),Formatter_1=require("./Formatter"),functions=functionsConfig,values=ValuesConfig,keywords=keywordsConfig,intellisense=IntellisenseConfig;class Shaderlab{constructor(e,t){this.document=e,this.position=t}provideCompletions(){let e=this.document.lineAt(this.position).text,t=e.charAt(this.position.character-1),i=[];if(this.isInTagsClourse(this.document,this.position))i=this.getTagsCompletions(this.document,this.position);else{let n=Utilities_1.default.getFirstNonSpaceCharInvInText(e,this.position.character-1);":"===n||":"===t?e.trim().startsWith("#")||(i=this.getRegisterTypeSet()):i="."===t?this.getVariablesIntellisenseSet(this.document,this.position):" "===t?this.getIntellisenseSet(this.document,this.position):this.getNormalCaseSet(this.document)}return i}getTagsCompletions(e,t){let i=[],n=this.getTagsCodeStringFromPosition(e,t),r=n.replace(/[\{\"]/gi,"="),o=Utilities_1.default.removeEmptyEntry(r.split("="));return i=o.length%2==1?n.endsWith('"')?this.getTagsValueCompletionSet(o[o.length-1].trim()):this.getTagsKeyCompletionSet():n.endsWith('"')?this.getTagsKeyCompletionSet():this.getTagsValueCompletionSet(o[o.length-1].trim())}getTagsValueCompletionSet(e){let t=[];if(!intellisense||!intellisense.Tags)return t;let i=intellisense.Tags[e];if(i&&i.values)for(var n in i.values){let e=i.values[n];t.push(this.getCompletionProposal(n,"",e,vscode_1.CompletionItemKind.Property))}return t}getTagsKeyCompletionSet(){let e=[];if(!intellisense||!intellisense.Tags)return e;for(var t in intellisense.Tags){let i=intellisense.Tags[t];i&&e.push(this.getCompletionProposal(t,"",i.documentation,vscode_1.CompletionItemKind.Property))}return e}getTagsCodeStringFromPosition(e,t){let i=new vscode_1.Range(new vscode_1.Position(0,0),t),n=e.getText(i),r=n.toLowerCase().lastIndexOf("tags");if(-1!=r){let e=n.substring(r+4).trim();return e}}isInTagsClourse(e,t){let i=this.getTagsCodeStringFromPosition(e,t);return!(!i||!i.startsWith("{")||-1!==i.indexOf("}"))}getVariablesIntellisenseSet(e,t){let i=[],n=this.getAllStructsIncludeInDocuments(e),r=this.getVariableTypeName(e,t,this.getAdditonTypeString(n),n),o=this.getTypeInfoInSetByName(r,n);return o&&o.fields.forEach(e=>{i.push(this.getCompletionProposal(e.name,e.type,e.documentation,vscode_1.CompletionItemKind.Field))}),i}getAdditonTypeString(e){let t=[];return e.forEach(e=>{e&&t.push(e.label)}),t}getAllStructsIncludeInDocuments(e){let t=e.getText(),i=this.getIncludeFilesContent(t,e.uri),n=this.getStructAndItsFieldInfo(t);return n=n.concat(this.getStructAndItsFieldInfo(Builtin_1.default.StructInfo)),i.forEach(e=>{n=n.concat(this.getStructAndItsFieldInfo(e.content))}),n}getFieldTypeInStruct(e,t){if(e&&e.fields&&t)for(let i=0;i<e.fields.length;i++){let n=e.fields[i];if(n.name===t)return n.type}}getTypeInfoInSetByName(e,t){for(let i in t){let n=t[i];if(n&&n.label===e)return n}}getVariablesHierarchy(e,t){let i=[],n=e.length-1;for(let r=e.length-1+t;r>=0;r--){let t=e.charAt(r);if(")"===t){i.push(new VariableHierarchyItem(Utilities_1.default.getMethodNameIfInMethodRange(e,r-1),!0));break}let o=[" ",",","{","(","[","\t",";","+","-","*","/"];if(-1!==o.indexOf(t)){let t=e.substring(r+1,n);i.push(new VariableHierarchyItem(t,!1));break}if("."===t){let t=e.substring(r+1,n);i.push(new VariableHierarchyItem(t,!1)),n=r}}return i}getVariableTypeName(e,t,i,n){let r=new vscode_1.Range(new vscode_1.Position(0,0),t),o=e.getText(r),s=e.lineCount,a=e.lineAt(s-1),l=new vscode_1.Range(t,a.range.end),u=e.getText(l),g="",d=this.getVariablesHierarchy(o,-1).reverse();if(0===d.length)return"";let m;if(d[0].isMethod){let t=d[0].Name;if(t){let i=this.getAllMethodInfo(e);for(let e=0;e<i.length;e++){let n=i[e];if(n&&n.label.trim()===t.trim()){m=this.getMethodReturnType(n);break}}}}else{let e=d[0].Name,t=this.getVariablesInfo(o,i.join("|"));for(let i=t.length-1;i>=0;i--){let n=t[i];if(n&&n.label===e){m=n.detail;break}}if(!m){t=this.getVariablesInfo(u,i.join("|"));for(let i=0;i<t.length;i++){let n=t[i];if(n&&n.label===e){m=n.detail;break}}}!m&&values.Items[e]&&(m=values.Items[e].type)}if(m){g=m;for(let e=1;e<d.length;e++){let t=this.getTypeInfoInSetByName(g,n);g=this.getFieldTypeInStruct(t,d[e].Name)}}return g}getIntellisenseSet(e,t){let i=[],n=Utilities_1.default.getFirstNonSpaceTexInv(e,t),r=Utilities_1.default.getSecondNonSpaceTexInv(e,t);if(!n)return i;let o=e=>{for(var t in e){var n=e[t];i.push(this.getCompletionProposal(t,"",n,intellisense.ItemKind))}},s=intellisense.Items[n.toLowerCase()];return s&&s.values?o(s.values):(s=intellisense.Items[r.toLowerCase()])&&s.values&&s.operation&&2===s.operation&&o(s.values),i}getRegisterTypeSet(){let e=[];for(var t in keywords.Items.reg){let i=keywords.Items.reg[t];e.push(this.getCompletionProposal(i,"","",keywords.ItemKind))}return e}getAllMethodInfo(e){let t=[];for(var i in functions.Items){var n=functions.Items[i];t.push(this.getCompletionProposal(i,n.detail,n.Synopsis,functions.ItemKind))}let r=e.getText();return t=t.concat(this.getMethodInfo(r)),this.getIncludeFilesContent(r,e.uri).forEach(e=>{t=t.concat(this.getMethodInfo(e.content))}),t}getNormalCaseSet(e){let t=[];for(var i in functions.Items){n=functions.Items[i];t.push(this.getCompletionProposal(i,n.detail,n.documentation,functions.ItemKind))}for(var i in values.Items){n=values.Items[i];t.push(this.getCompletionProposal(i,n.detail,n.documentation,values.ItemKind))}for(var i in keywords.Items){var n=keywords.Items[i];for(var r in n){let e=n[r];if(!e)continue;let i=this.getDocumentationInIntellisenseConfig(e.toLowerCase(),intellisense);t.push(this.getCompletionProposal(e,"",i,keywords.ItemKind))}}let o=e.getText();t=t.concat(this.getMethodInfo(o));let s=this.getIncludeFilesContent(o,e.uri);s.forEach(e=>{t=t.concat(this.getMethodInfo(e.content))}),t=t.concat(this.getMacrosDefinations(o)),s.forEach(e=>{t=t.concat(this.getMacrosDefinations(e.content))}),t=t.concat(this.getPropertiesInfo(o));var a=this.getStructuresInfo(o);t=t.concat(a),s.forEach(e=>{a=a.concat(this.getStructuresInfo(e.content)),t=t.concat(a)});let l=[];return a.forEach(e=>{e&&l.push(e.label)}),t=t.concat(this.getVariablesInfo(o,l.join("|")))}getMacrosDefinations(e){return this.getCompletionItemFromMatchResult(e,this.getMacrosDefinitationFromCode,e=>{let t=e.indexOf("(");return-1!==t?this.getCompletionProposal(e.substring(8,t),"","",vscode_1.CompletionItemKind.Method):this.getCompletionProposal(e.substring(8),"","",vscode_1.CompletionItemKind.Property)})}getVariablesInfo(e,t){let i=[],n=this.getVariablesFromCode(e,t);for(var r in n){let e=n[r];if(e){let t=e.substring(0,e.length-1).split(" ",2);if(2==t.length){let e=t[0].trim(),n=t[1].trim();i.push(this.getCompletionProposal(n,e,"",vscode_1.CompletionItemKind.Variable))}}}return i}getPropertiesInfo(e){return this.getCompletionItemFromMatchResult(e,this.getPropertiesDefinationFromCode,e=>{let t=e.replace(/\(/gi,",").replace(/\)/gi,",").split(",");if(t.length>=4)return this.getCompletionProposal(t[0].trim(),t[2].trim(),"",vscode_1.CompletionItemKind.Property)})}getStructuresInfo(e){return this.getCompletionItemFromMatchResult(e,this.getStructDefinationFromCode,e=>{let t=e.substring(6,e.length-7).split("{");if(t.length>=2)return this.getCompletionProposal(t[0].trim(),"struct","",vscode_1.CompletionItemKind.Struct)})}getStructAndItsFieldInfo(e){let t=[],i=this.getStructDefinationFromCode(e),n=new Formatter_1.default("\t");for(var r in i){let e=n.removeComments(i[r]);if(e){let i=e.substring("struct".length).split("{",2);if(2==i.length){let e=new TypeInfomation,n=i[0].trim();e.label=n;let r=i[1].trim().split(/[;\r\n]/);for(var o in r){let t=r[o],i=this.getTypeFiledInfomation(t);if(i){var s=this.getTypeFiledInfomation(t);if(-1!==s.name.indexOf(",")){let t=s.name.split(",");for(let i=0;i<t.length;i++){let n=new TypeFiledInformation;n.name=t[i].trim(),n.documentation=s.documentation,n.type=s.type,e.fields.push(n)}}else e.fields.push(s)}}t.push(e)}}}return t}getTypeFiledInfomation(e){let t=e.trim(),i=t.indexOf("//");if(-1!==i&&(t=t.substring(0,i+1)),-1!==(i=t.indexOf(":"))&&(t=t.split(":",2)[0]),-1!==t.indexOf(",")){let i=Utilities_1.default.removeEmptyEntry(t.split(",")),n=new TypeFiledInformation,r=i[0].split(" ");return r.length>=2&&(n.type=r[r.length-2].trim()),i[0]=r[r.length-1].trim(),n.name=i.join(","),n.documentation=e.trim(),n}{let i=Utilities_1.default.removeEmptyEntry(t.split(" "));if(i.length>=2){let t=new TypeFiledInformation;return t.name=i[i.length-1].trim(),-1!=t.name.indexOf("[")&&(t.name=t.name.split("[")[0]),t.type=i[i.length-2].trim(),t.documentation=e.trim(),t}}}getMethodReturnType(e){if(e.kind===vscode_1.CompletionItemKind.Method)if("string"==typeof e.documentation){let t=Utilities_1.default.removeEmptyEntry(e.documentation.split(" "));if(t.length>0)return t[0]}else{let t=Utilities_1.default.removeEmptyEntry(e.documentation[0].split(" "));if(t.length>0)return t[0]}}getMethodInfo(e){return this.getCompletionItemFromMatchResult(e,this.getMethodCodeLineFromCode,e=>{let t=this.getMethodNameFromSignatureCode(e);if(t)return this.getCompletionProposal(t,"",e.substring(0,e.length-1).trim(),vscode_1.CompletionItemKind.Method)})}getCompletionItemFromMatchResult(e,t,i){let n=[],r=t(e);for(var o in r){let e=r[o];if(e){let t=i(e);t&&n.push(i(e))}}return n}getCompletionProposal(e,t,i,n){let r=new vscode_1.CompletionItem(e,n);return r.detail=t,r.documentation=i,r}provideHover(){let e,t=this.document.getWordRangeAtPosition(this.position),i=this.document.getText(t);if(e=values.Items[i])return new vscode_1.Hover(e.documentation,t);var n=this.document.lineAt(this.position.line).text;if(e=functions.Items[i]){let i=!1;for(let e=t.end.character;e<n.length;e++){let t=n.charAt(e);if(" "!==t){if("("===t){i=!0;break}break}}if(i)return new vscode_1.Hover(e.documentation,t)}let r=this.getDocumentationInIntellisenseConfig(i.toLowerCase(),intellisense);return r?new vscode_1.Hover(r,t):i!=this.document.getText()&&/[\w_\d]+/.test(i)?new vscode_1.Hover(i,t):null}provideSignatureHelp(){let e=this.getFunctionName(this.document,this.position);if(!e)return;let t=new vscode_1.SignatureHelp,i=this.document.getText(),n=this.getSignatureInCodeByName(i,e);if(n)t.signatures.push(n);else{let o=this.getIncludeFilesContent(i,this.document.uri);for(var r in o){let i=o[r];if(i&&(n=this.getSignatureInCodeByName(i.content,e))){t.signatures.push(n);break}}}if(!n){let i=this.getSignatureDataByFuncNameInConfig(e);i&&i.Synopsis.forEach(e=>{t.signatures.push(this.getSignatureInformationFromCode(e,i.documentation))})}return t.activeSignature=0,t.activeParameter=this.calcActiveParameter(this.document,this.position),t}getSignatureInCodeByName(e,t){let i=this.getMethodInfoInCode(e);for(var n in i){let e=i[n];if(e&&e.name===t)return this.getSignatureInformationFromCode(e.signature,e.signature)}let r=this.getMacrosDefinitationFromCode(e);for(var n in r){let e=r[n],i=e.indexOf("(");if(-1!==i){let n=e.substring(8,i);if(n===t)return this.getSignatureInformationFromCode(e.substring(8),e)}}}getMethodInfoInCode(e){let t=[],i=this.getMethodCodeLineFromCode(e);for(var n in i){let e=i[n];if(e){let i=this.getMethodNameFromSignatureCode(e),n=e.substring(0,e.length-1).trim();t.push({name:i,signature:n})}}return t}getSignatureInformationFromCode(e,t){let i=new vscode_1.SignatureInformation(e);i.documentation=t;let n=this.getParameterInfosFromSignatureCode(e);return i.parameters=n,i}getSignatureDataByFuncNameInConfig(e){return functions.Items[e]}getFunctionName(e,t){let i,n=e.lineAt(t.line),r=1;for(i=t.character-1;i>0&&r>0;i--){let e=n.text.charAt(i);")"===e&&r++,"("===e&&r--}if(r>0||i<=0)return"";let o=new vscode_1.Position(t.line,i);return e.getText(e.getWordRangeAtPosition(o))}calcActiveParameter(e,t){let i=e.lineAt(t.line),n=0,r=0;for(let e=t.character-1;e>0;e--){let t=i.text.charAt(e);","===t&&0===r&&n++,"("===t&&r++,")"===t&&r--}return n}provideSymbols(){return this.getDocumentSymbols(this.document)}static getMatchResult(e,t,i){return t.match(new RegExp(e.source,i))}getMethodSymbols(e){let t=Shaderlab.getSymbols(Shaderlab.getMethodRegPattern(),e,vscode_1.SymbolKind.Method,"gm");return t.forEach(e=>e.name=this.getMethodNameFromSignatureCode(e.name)),t}getVariablesSymbols(e,t){let i=Shaderlab.getSymbols(this.getVariablesRegPattern(t,!0),e,vscode_1.SymbolKind.Variable,"g");return i.forEach(e=>{let t=Utilities_1.default.removeEmptyEntry(e.name.trim().split(/[ \t\r\n\);,:]/));t.length>1?e.name=t[1]:e.name=t[0]}),i}getStructDefinationSymbols(e){let t=Shaderlab.getSymbols(Shaderlab.getStructDefinationRegPattern(),e,vscode_1.SymbolKind.Class,"gm");return t.forEach(e=>e.name=e.name.trim().split(/[ \t\r\n\{]/)[1]),t}getPropertiesDefinationSymbols(e){let t=Shaderlab.getSymbols(Shaderlab.getPropertiesDefinationRegPattern(),e,vscode_1.SymbolKind.Property,"g");return t.forEach(e=>e.name=e.name.trim().split(/[ \t]/)[0]),t}getMacrosDefinationSymbols(e){let t=Shaderlab.getSymbols(Shaderlab.GetMacrosRegPattern(),e,vscode_1.SymbolKind.Property,"g");return t.forEach(e=>{let t=e.name.indexOf("(");-1!==t?(e.name=e.name.substring(8,t),e.kind=vscode_1.SymbolKind.Method):e.name=e.name.substring(8)}),t}getDocumentSymbols(e){let t=this.getMethodSymbols(e);t=(t=t.concat(this.getStructDefinationSymbols(e))).concat(this.getPropertiesDefinationSymbols(e));let i=this.getAdditonTypeString(this.getAllStructsIncludeInDocuments(e));return t=t.concat(this.getVariablesSymbols(e,i.join("|"))),t=t.concat(this.getMacrosDefinationSymbols(e))}getDocumentationInIntellisenseConfig(e,t){if(e){var i=t.Items[e];if(i)return i.documentation}return""}getParameterInfosFromSignatureCode(e){let t=[],i=e.replace("(",",").replace(")","").split(",");if(i.length>1)for(var n=1;n<i.length;n++){let r=i[n],o=new vscode_1.ParameterInformation(e);o.label=r,t.push(o)}return t}getMethodNameFromSignatureCode(e){let t=e.replace("("," ").split(" "),i=0;for(let e=0;e<t.length;e++)if(t[e]&&i<1)i++;else if(1===i)return t[e]}getIncludeFilesContent(e,t){let i=[];return this.getIncludeFiles(e).forEach(e=>{let n=Utilities_1.default.getPath(t,e);if(!n)return;let r=Utilities_1.default.readFile(n.fsPath);r&&i.push(new IncludeFile(n.path,r))}),i}getIncludeFiles(e){let t=[],i={},n=this.getIncludeDefinationFromCode(e);for(var r in n){let e=n[r];if(e){let n=e.split('"');n.length>2&&(i[n[1]]||(t.push(n[1]),i[n[1]]=1))}}return t}getMethodCodeLineFromCode(e){return Shaderlab.getMatchResult(Shaderlab.getMethodRegPattern(),e,"gm")}getVariablesFromCode(e,t){let i=this.getVariablesRegPattern(t);return Shaderlab.getMatchResult(i,e,"g")}getStructDefinationFromCode(e){return Shaderlab.getMatchResult(Shaderlab.getStructDefinationRegPattern(),e,"gm")}getPropertiesDefinationFromCode(e){return Shaderlab.getMatchResult(Shaderlab.getPropertiesDefinationRegPattern(),e,"g")}getIncludeDefinationFromCode(e){return Shaderlab.getMatchResult(Shaderlab.getIncludeDefinationRegPattern(),e,"g")}getMacrosDefinitationFromCode(e){return Shaderlab.getMatchResult(Shaderlab.GetMacrosRegPattern(),e,"g")}static getMethodRegPattern(){return/[\d\w_]+?\s+?(?!if|for)[\d\w_]+?\s*?\([\s\d\w,:_]*?\)\s*?(:[\s\d\w_]+?){0,1}\s*?\{/}static GetMacrosRegPattern(){return/#define[ \t]+([\d\w_]+)(\([\d\w_, ]+\))?/}getVariablesRegPattern(e,t=!1){let i,n=`((InputPatch|OutputPatch|RWByteAddressBuffer|RWBuffer|ConsumeStructuredBuffer|ByteAddressBuffer|Buffer|AppendStructuredBuffer|Texture2DMS|Texture2DMSArray|TextureCube|TextureCubeArray|Texture1DArray|RWTexture1DArray|RWTexture2DArray|Texture2DArray|RWTexture2D|Texture2D|StructuctedBuffer|RWStructuredBuffer|RWTexture3D|Texture3D|RWTexture1D|Texture1D)(<[\\w\\d]+?>)?)|SurfaceOutput|appdata_base|appdata_tan|appdata_full|appdata_img|sampler|sampler2D|sampler3D|samplerCUBE|string|triangle|triangleadj|vector|((float|int|uint|bool|half|fixed|double)(\\d*?|\\d*?x\\d*?))`;return i=e?t?`(${n}|${e})\\s+?[\\w\\d_]+?\\s*?[;=]`:`(${n}|${e})\\s+?[\\w\\d_]+?\\s*?[:;)=,]`:t?`(${n})\\s+?[\\w\\d_]+?\\s*?[;=]`:`(${n})\\s+?[\\w\\d_]+?\\s*?[;:)=,]`,new RegExp(i)}static getStructDefinationRegPattern(){return/\bstruct\b\s*?[\S]*?\s*?\{[\s\S]*?\}[\s]*?;?/}static getPropertiesDefinationRegPattern(){return/[_\d\w]+?\s*?\("[\s\S]*?",[\s\S]*?\)\s*?=/}static getIncludeDefinationRegPattern(){return/#include\s*?\"[\s\S]+?\"/}static getSymbols(e,t,i,n){let r=new RegExp(e.source,n),o=null,s=[],a=t.getText();for(;o=r.exec(a);){let e=t.positionAt(o.index).line,n=t.lineAt(e).range;o[0];s.push(new vscode_1.SymbolInformation(o[0].trim(),i,"",new vscode_1.Location(t.uri,n)))}return s}}class MethodInfo{constructor(e,t,i){this.name=e,this.filePath=t,this.code=i}}class TypeInfomation{constructor(){this.label="",this.fields=[]}}class VariableHierarchyItem{constructor(e,t){this.Name=e,this.isMethod=t}}class IncludeFile{constructor(e,t){this.path=e,this.content=t}}class TypeFiledInformation{constructor(){this.type="",this.name="",this.documentation=""}}exports.default=Shaderlab;