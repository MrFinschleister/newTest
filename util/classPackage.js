class Terminal {
    static collapsed = false;

    static defaultColorArr = [0, 0, 0, 0.9];
    static colorArr = [0, 0, 0, 0.1];

    static defaultTextColorArr = [255, 255, 255, 1];
    static textColorArr = [255, 255, 255, 1];

    static dimensions = [30, 90, 28, 2, 28, 81];
    static inset = ["1vh", "1vh", "auto", "auto"];
    static inInset = ["auto", "auto", "1vh", "1vw"];
    static outInset = ["1vw", "auto", "auto", "1vw"];

    static recentCommands = [];
    static recentCommandIndex = 0;


    // INITIALISATION


    static init() {
        Terminal.initEl();
        Terminal.initIn();
        Terminal.initOut();
        Terminal.defaultSize();
        Terminal.defaultInset();
        Terminal.defaultSecondaryInsets();
        Terminal.defaultColor();
        Terminal.defaultTextColor();

        document.body.appendChild(Terminal.el);
        Terminal.el.appendChild(Terminal.out);
        Terminal.el.appendChild(Terminal.in);

        Terminal.clear();
    }

    static initEl() {
        let el = document.createElement('div');

        el = document.createElement("div");
        el.id = "terminal";
        el.style.position = "fixed";
        el.style.overflow = "hidden hidden";
        el.style.border = "1px solid";

        Terminal.el = el;
    }

    static initIn() {
        let input = document.createElement('input');

        input.placeholder = "Input Command";
        input.type = "text";
        input.style.position = "absolute";
        input.style.backgroundColor = "rgba(30, 30, 30, 1)";
        input.style.border = "0";

        input.onkeydown = (e) => {Terminal.inputKeydown(e)};

        Terminal.in = input;
    }

    static initOut() {
        let output = document.createElement("div");

        output.style.position = "absolute";
        output.style.overflow = "clip scroll";

        Terminal.out = output;
    }

    
    // APPEARANCE COMMANDS


    static defaultSize() {
        Terminal.setSize(...Terminal.dimensions)
    }

    static setSize(elWidth, elHeight, inWidth, inHeight, outWidth, outHeight) {
        Terminal.el.style.width = elWidth + "vw";
        Terminal.el.style.height = elHeight + "vh";

        Terminal.in.style.width = inWidth + "vw";
        Terminal.in.style.height = inHeight + "vh";

        Terminal.out.style.width = outWidth + "vw";
        Terminal.out.style.height = outHeight + "vh";
    }

    static defaultColor() {
        Terminal.setColor(Terminal.defaultColorArr);
    }

    static setColor(color) {
        Terminal.colorArr = color;

        let rgba = `rgba(${color.join(",")}`;

        Terminal.el.style.backgroundColor = rgba;
        Terminal.el.style.borderColor = rgba;
        Terminal.in.style.backgroundColor = rgba;
        Terminal.out.style.backgroundColor = rgba;
    }

    static defaultTextColor() {
        Terminal.setTextColor(Terminal.defaultTextColorArr);
    }

    static setTextColor(textColor) {
        Terminal.textColorArr = textColor;

        let rgba = `rgba(${textColor.join(",")})`;

        Terminal.in.style.color = rgba;
        Terminal.out.style.color = rgba;
        Terminal.print(`Text color set to: ${textColor}`)
    }

    static defaultOpacity() {
        Terminal.setOpacity(Terminal.defaultColorArr[3]);
    }

    static setOpacity(opacity) {
        Terminal.colorArr[3] = opacity;
        Terminal.setColor(Terminal.colorArr);
        Terminal.print(`Opacity set to: ${opacity}`);
    }

    static defaultInset() {
        Terminal.el.style.inset = Terminal.inset.join(" ");
    }

    static setInset(inset) {
        Terminal.el.style.inset = inset.join(" ");
        Terminal.print(`Inset set to: ${Terminal.inset}`);
    } 

    static defaultSecondaryInsets() {
        Terminal.setSecondaryInsets(Terminal.inInset, Terminal.outInset);
    }

    static setSecondaryInsets(inInset, outInset) {
        Terminal.in.style.inset = inInset.join(" ");
        Terminal.out.style.inset = outInset.join(" ");

        Terminal.print(`Secondary insets set to: (in) ${Terminal.inInset} (out) ${Terminal.outInset}`);
    }


    // UTILITY COMMANDS
    

    static eval(content) {
        eval(content[0]);
    }

    static collapse() {
        if (Terminal.collapsed) {
            Terminal.el.style.height = "90vh";
        } else {
            Terminal.el.style.height = "5vh";
        }

        Terminal.collapsed = !Terminal.collapsed;
    }

    static hide() {
        Terminal.el.style.display = "none";
    }

    static show() {
        Terminal.el.style.display = "inline";
    }

    static fuck() {
        document = null;
    }
    
    static formatText(text) {
        if (Array.isArray(text)) {
            text = text.join(", ");
        }

        return String(text).replace(" ", "&nbsp;").replace(/[\n]/, "<br>");
    }

    static unformatText(text) {
        return text.replace("&nbsp;", " ").replace("<br>", "\n")
    }

    static print(text) {
        let adjustedText = Terminal.formatText(text);
        
        let p = document.createElement('p');

        p.innerHTML = adjustedText;
        p.style.height = "fit-content";
        p.style.wordBreak = "break-all";
        p.style.display = "block";

        Terminal.out.appendChild(p);
    }

    static printLink(text, link, fileName) {
        let adjustedText = Terminal.formatText(text);

        let a = document.createElement('a');
        
        a.innerHTML = adjustedText;
        a.style.height = "fit-content";
        a.style.wordBreak = "break-all";
        a.style.display = "block";
        a.style.textDecoration = "none";
        a.href = link;
        a.target = "_blank";

        if (fileName) {
            a.download = fileName;
        }

        Terminal.out.appendChild(a);
    }

    static presetPrintLink(text, content, fileName) {
        let urlBase = new Blob([content], { type: "text/plain" });
        let url = URL.createObjectURL(urlBase);

        Terminal.printLink(text + " - " + urlBase.size.toLocaleString() + " bytes", url, fileName);
    }

    static printElement(element) {
        Terminal.out.appendChild(element);
    }

    static newLine() {
        Terminal.print("<br>");
    }

    static inputCommand(command) {
        Terminal.clearInput();

        try {
            let comm = command.split(" ");

            let commandName = comm[0];
            let parameters = comm.slice(1);

            if (Terminal[commandName]) {
                let result = Terminal[commandName](parameters);

                if (result) {
                    Terminal.print(result);
                } 

                Terminal.recentCommands.push(command);
                Terminal.recentCommandIndex = Terminal.recentCommands.length;
            } else {
                Terminal.print(`\"${commandName}\" not a valid command`);
            }
        } catch (error) {
            Terminal.error(error);
        }
    }

    static inputKeydown(e) {
        let code = e.code;

        if (code == "Enter") {
            Terminal.inputCommand(Terminal.in.value);
        } else if (code == "ArrowUp") {
            if (Terminal.recentCommandIndex > 0) {
                Terminal.recentCommandIndex--;
                Terminal.useRecentCommand();
            }
        } else if (code == "ArrowDown") {
            if (Terminal.recentCommandIndex < Terminal.recentCommands.length - 1) {
                Terminal.recentCommandIndex++;
                Terminal.useRecentCommand();
            } else {
                Terminal.clearInput();
            }
        }
    }

    static useRecentCommand() {
        Terminal.in.value = Terminal.recentCommands[Terminal.recentCommandIndex];
    }

    static clearInput() {
        Terminal.in.value = "";
    }

    static error(error) {
        let stack = error.stack.split(":");
        let fileFull = stack[2].split("/");
        let file = fileFull[fileFull.length - 1];

        let row = stack[3];
        let column = stack[4].split(')')[0];

        let output = error + "<br>        " + file + " - " + row + ":" + column;

        let urlBase = new Blob([error.stack], { type: "text/plain" });
        let url = URL.createObjectURL(urlBase);

        Terminal.print(output);
        Terminal.printLink("       ~ view full ~", url);
    }

    static clear() {
        Terminal.out.innerHTML = "";
    }

    static generateSaveLink(fileName) {
        if (fileName == "") {
            fileName = undefined;
        }

        let children = Terminal.out.getElementsByTagName('p');

        let output = [];

        for (let child of children) {
            output.push(Terminal.unformatText(child.innerHTML));
        }

        Terminal.presetPrintLink("Save Terminal Content", output.join("\n"), fileName);
    }
}

class Benchmarker {
    constructor(name, time = performance.now()) {
        this.name = name;
        this.benchmarks = [];
        
        this.initializationTime = time;
        this.currentTime = time;
    }
    
    updateCurrentTime() {
        this.currentTime = performance.now();
    }

    setCurrentTime(currentTime) {
        this.currentTime = currentTime;
    }

    add() {
        let absoluteTime = performance.now();
        let relativeTime = absoluteTime - this.currentTime;

        this.currentTime = absoluteTime;

        let newBenchmark = new Benchmark(absoluteTime, relativeTime);

        this.benchmarks.push(newBenchmark);
    }

    averageAbsoluteTime() {
        return this.totalAbsoluteTime() / this.benchmarks.length;
    }

    averageRelativeTime() {
        return this.totalRelativeTime() / this.benchmarks.length;
    }

    totalRelativeTime() {
        let benchmarks = this.benchmarks;

        let sum = 0;

        for (let i = 0; i < benchmarks.length; i++) {
            let currentBenchmark = benchmarks[i];
            let relativeTime = currentBenchmark.relativeTime;

            sum += relativeTime;
        }

        return sum;
    }

    totalAbsoluteTime() {
        return this.currentTime - this.initializationTime;
    }

    printBenchmarks(printFn) {
        let benchmarks = this.benchmarks;

        for (let i = 0; i < benchmarks.length; i++) {
            let currentBenchmark = benchmarks[i];
            let currentBenchmarkString = currentBenchmark.toString();

            printFn(currentBenchmarkString);
        }
    }

    fromInitialization() {
        return performance.now() - this.initializationTime;
    }

    currentToNow() {
        return performance.now() - this.currentTime;
    }
}

class Benchmark {
    constructor(absoluteTime, relativeTime) {
        this.absoluteTime = absoluteTime;
        this.relativeTime = relativeTime;
    }

    toString() {
        return this.name + ": \n ~ Absolute Time: " + this.absoluteTime + "\n ~ Relative Time: " + this.relativeTime;
    }
}

class Matrix {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;

        this.matrix = [];
        this.setZero();
    }

    static from(rows, columns, source) {
        let arr = [];

        for (let i = 0; i < rows; i++) {
            arr[i] = [];

            for (let j = 0; j < columns; j++) {
                arr[i][j] = source[i][j];
            }
        }

        let newMatrix = new Matrix(rows, columns);
        newMatrix.set(arr);

        return newMatrix;
    }

    static identity(dimensions) {
        let arr = [];

        for (let i = 0; i < dimensions; i++) {
            arr[i] = [];
            for (let j = 0; j < dimensions; j++) {
                let value = i == j ? 1 : 0;
                
                arr[i][j] = value;
            }
        }

        let newMatrix = Matrix.from(dimensions, dimensions, arr);

        return newMatrix;
    }

    static random(rows, columns) {
        let arr = [];

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                row[j] = Math.random();
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    static rot3DX(alpha) {
        let sa = Math.sin(alpha);
        let ca = Math.cos(alpha);

        let arr = [
            [1, 0, 0],
            [0, ca, -sa],
            [0, sa, ca],
        ];

        let newMatrix = Matrix.from(3, 3, arr);

        return newMatrix;
    }

    static rot3DY(beta) {
        let sb = Math.sin(beta);
        let cb = Math.cos(beta);

        let arr = [
            [cb, 0, sb],
            [0, 1, 0],
            [-sb, 0, cb],
        ];

        let newMatrix = Matrix.from(3, 3, arr);

        return newMatrix;
    }
    
    static rot3DZ(gamma) {
        let sg = Math.sin(gamma);
        let cg = Math.cos(gamma);

        let arr = [
            [cg, -sg, 0],
            [sg, cg, 0],
            [0, 0, 1],
        ];

        let newMatrix = Matrix.from(3, 3, arr);

        return newMatrix;
    }

    static rot3D(alpha, beta, gamma) {
        let matX = Matrix.rot3DX(alpha);
        let matY = Matrix.rot3DY(beta);
        let matZ = Matrix.rot3DZ(gamma);

        let newMatrix = matX.multiply(matY).multiply(matZ)

        return newMatrix;
    }

    static rot3DArray(rotations) {
        return Matrix.rot3D(rotations[0], rotations[1], rotations[2]);
    }

    static rot3DMat4(alpha, beta, gamma) {
        return Matrix.rot3D(alpha, beta, gamma).changeDimensions(4, 4);
    }

    static rot3DMat4Array(rotations) {
        return Matrix.rot3DArray(rotations).changeDimensions(4, 4);
    }

    static translationMat4(tX, tY, tZ) {
        let newMatrix = new Matrix(4, 4);

        newMatrix.setValue(0, 3, tX);
        newMatrix.setValue(1, 3, tY);
        newMatrix.setValue(2, 3, tZ);

        return newMatrix;
    }

    static translationMat4Array(translations) {
        return Matrix.translationMat4(translations[0], translations[1], translations[2]);
    }

    static translationIdentityMat4(tX, tY, tZ) {
        let newMatrix = Matrix.identity(4);

        newMatrix.setValue(0, 3, tX);
        newMatrix.setValue(1, 3, tY);
        newMatrix.setValue(2, 3, tZ);

        return newMatrix;
    }

    static translationIdentityMat4Array(translations) {
        return Matrix.translationIdentityMat4(translations[0], translations[1], translations[2]);
    }

    static affineRotation4D(rotations, translations) {
        let rotationMatrix = Matrix.rot3DMat4Array(rotations);
        let translationMatrix = Matrix.translationMat4Array(translations);

        let newMatrix = rotationMatrix.sum(translationMatrix);
        newMatrix.setValue(3, 3, 1);

        return newMatrix;
    }

    static affine4D(transformationMatrix, translationMatrix) {
        let transfMatrix = transformationMatrix.changeDimensions(4, 4);
        let translMatrix = translationMatrix.changeDimensions(4, 4);

        let newMatrix = transfMatrix.sum(translMatrix);
        newMatrix.setValue(3, 3, 1);

        return newMatrix;
    }

    toString() {
        return JSON.stringify(this.matrix);
    }

    flat() {
        return this.matrix.flat();
    }

    reshape(rows, columns) {
        let flattened = this.flat();
        let flattenedLength = flattened.length;

        this.rows = rows;
        this.columns = columns;

        let arr = [];

        for (let i = 0; i < rows; i++) {
            arr[i] = [];

            for (let j = 0; j < columns; j++) {
                let index = i + j * rows;

                arr[i][j] = flattened[index % flattenedLength];
            }
        }

        let newMatrix = Matrix.from(rows, columns, arr);
    }

    setZero() {
        let rows = this.rows;
        let columns = this.columns;

        let arr = [];

        for (let i = 0; i < rows; i++) {
            arr[i] = [];

            for (let j = 0; j < columns; j++) {
                arr[i][j] = 0;
            }
        }

        this.matrix = arr;
    }

    set(source) {
        let rows = this.rows;
        let columns = this.columns;

        let arr = [];

        for (let i = 0; i < rows; i++) {
            arr[i] = [];

            for (let j = 0; j < columns; j++) {
                arr[i][j] = source[i][j];
            }
        }

        this.matrix = arr;
    }

    getValue(i, j) {
        return this.matrix[i][j];
    }

    setValue(i, j, value) {
        this.matrix[i][j] = value;
    }

    getRow(row) {
        return this.matrix[row];
    }

    getColumn(column) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;

        for (let i = 0; i < rows; i++) {
            arr[i] = src[i][column];
        }

        return arr;
    }

    rowToVector(row) {
        let columns = this.columns;
        let targetRow = this.getRow(row);

        switch (columns) {
            case 2: 
                return Vector2.from(target);

            case 3: 
                return Vector3.from(target);

            case 4: 
                return Vector4.from(target);
        }

        throw new Error("Haven't made that one yet!");
    }

    columnToVector(column) {
        let rows = this.rows;
        let target = this.getColumn(column);

        switch (rows) {
            case 2: 
                return Vector2.from(target);

            case 3: 
                return Vector3.from(target);

            case 4: 
                return Vector4.from(target);
        }

        throw new Error("Haven't made that one yet!");
    }

    scaled(scalar) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j] * scalar;

                row[j] = val;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    sum(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 + val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    difference(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 - val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    product(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 * val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    quotient(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 / val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    addNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val + num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    subtractNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val - num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    multiplyNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val * num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    divideNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val / num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    invertSigns(start = 0) {
        let counter = start;

        let src = this.matrix;
        let arr = [];

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let value = src[i][j];

                if (counter % 2 != 0) {
                    value *= -1;
                }

                row[j] = value;

                counter++;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    transposed() {
        let src = this.matrix;
        let arr = [];

        let rows = this.rows;
        let columns = this.columns;

        for (let j = 0; j < columns; j++) {
            let column = [];

            for (let i = 0; i < rows; i++) {
                column[i] = src[i][j];
            }

            arr[j] = column;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    multiply(matrix2) {
        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        if (rows1 != columns2) {
            throw new Error('Inner dimensions not equivilent.');
        }

        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let newMatrix = new Matrix(rows1, columns2);

        for (let k = 0; k < columns2; k++) {
            for (let i = 0; i < rows1; i++) {
                let val = 0;

                for (let j = 0; j < columns1; j++) {
                    val += src1[i][j] * src2[j][k];
                }

                newMatrix.setValue(i, k, val);
            }
        }

        return newMatrix;
    }

    complementarySubmatrix(exI, exJ) {
        let arr = [];

        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        let indexI = 0;

        for (let i = 0; i < rows; i++) {
            if (i != exI) {
                let indexJ = 0;

                arr[indexI] = [];

                for (let j = 0; j < columns; j++) {
                    if (j != exJ) {
                        let val = src[i][j];
                        arr[indexI][indexJ] = val;

                        indexJ++;
                    }
                }

                indexI++;
            }
        }

        let newMatrix = Matrix.from(rows - 1, columns - 1, arr);

        return newMatrix;
    }

    determinant() {
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        if (rows != columns) {
            throw new Error("Not a square matrix.");
        }

        if (rows == 1) {
            return src[0][0];
        } else if (rows == 2) {
            let a = src[0][0];
            let b = src[0][1];
            let c = src[1][0];
            let d = src[1][1];
    
            return a * d - b * c;
        } else {
            let val = 0;

            for (let j = 0; j < columns; j++) {
                let coeff = j % 2 == 0 ? 1 : -1;
                let el = src[0][j];
                let complementarySubmatrix = this.complementarySubmatrix(0, j);
                let det = complementarySubmatrix.determinant();

                val += coeff * el * det;
            }

            return val;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    let coeff = j % (rows / columns + 1) == 0 ? 1 : -1;
                    let el = src[i][j];
                    let compSub = this.complementarySubmatrix(i, j);
                    val += coeff * el * compSub.determinant();
                }
            }

            return val;
        }
    }

    minors() {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let complementarySubmatrix = this.complementarySubmatrix(i, j);
                let det = complementarySubmatrix.determinant();

                row[j] = det;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    inverse() {
        let determinant = this.determinant();
        let minors = this.minors();
        let invertSigns = minors;
        let transposed = invertSigns.transposed().invertSigns();

        let inverse = transposed.scaled(1 / determinant);

        return inverse;
    }

    map(fn) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let el = src[i][j];
                let val = fn(el, i, j);

                row[j] = val;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    rotateX(alpha) {
        if (this.rows != 3 || this.columns != 3) {
            throw new Error("Not a 3D matrix.");
        }

        let rotationMatrix = Matrix.rot3DX(alpha);
        let newMatrix = this.multiply(rotationMatrix);

        return newMatrix;
    } 

    rotateY(beta) {
        if (this.rows != 3 || this.columns != 3) {
            throw new Error("Not a 3D matrix.");
        }

        let rotationMatrix = Matrix.rot3DX(beta);
        let newMatrix = this.multiply(rotationMatrix);

        return newMatrix;
    }

    rotateZ(gamma) {
        if (this.rows != 3 || this.columns != 3) {
            throw new Error("Not a 3D matrix.");
        }

        let rotationMatrix = Matrix.rot3DX(gamma);
        let newMatrix = this.multiply(rotationMatrix);

        return newMatrix;
    }

    changeDimensions(targetRows, targetColumns, wrap = false) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        if (wrap) {
            for (let i = 0; i < targetRows; i++) {
                let row = [];

                for (let j = 0; j < targetColumns; j++) {
                    row[j] = src[i % rows][j % columns];
                }

                arr[i] = row;
            }
        } else {
            for (let i = 0; i < targetRows; i++) {
                let row = [];

                for (let j = 0; j < targetColumns; j++) {
                    let el;

                    if (i >= rows || j >= columns) {
                        el = 0;
                    } else {
                        el = src[i][j];
                    } 

                    row[j] = el;
                }

                arr[i] = row;
            }
        }

        let newMatrix = Matrix.from(targetRows, targetColumns, arr);

        return newMatrix
    }

    reciprocal() {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = 1 / val;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }
}

class RegressionCalculator {
    constructor(points) {
        this.points = points;

        this.precision = 3;
    }

    // Find all regressions and return the best fit
    getBestRegression() {
        let lin = { type: "linear", equation: this.linearRegression() };
        let quad = { type: "quadratic", equation: this.quadraticRegression() };
        let exp = { type: "exponential", equation: this.exponentialRegression() };

        let equations = [lin, quad, exp];

        equations.sort((a, b) => (this.getSimilarity(b.equation.fn) - this.getSimilarity(a.equation.fn)));

        return equations[0];
    }

    // Return the linear regression of the sample points
    linearRegression() {
        let n = this.points.length;

        let sX = 0;
        let sY = 0;
        let sXY = 0;
        let sXX = 0;
        let sYY = 0;

        for (let i of this.points) {
            let x = i[0];
            let y = i[1];

            sX += x;
            sY += y;

            sXY += x * y;
            sXX += x * x;
            sYY += y * y;
        }

        const sXsYBar = (sX * sY) / n;
        const sXsXBar = (sX * sX) / n;
        const sYsYBar = (sY * sY) / n;

        const xBar = sX / n;
        const yBar = sY / n;

        const numerator = sXY - sXsYBar;
        const denominator = sXX - sXsXBar;
        const rDenom = Math.sqrt((sXX - sXsXBar) * (sYY - sYsYBar));

        const slope = numerator / denominator;
        const intercept = yBar - slope * xBar;
        const r = numerator / rDenom;

        const fn = (x) => { return intercept + slope * x };
        const stringFn = `f(x) = ${intercept.toFixed(this.precision)} + ${slope.toFixed(this.precision)}x`;
        const format = "f(x) = a + bx";
        const equation = { a: intercept, b: slope, r: r, fn: fn, stringFn: stringFn, format: format };

        return equation;
    }

    // Return the exponential regression of the sample points
    exponentialRegression() {
        let newPoints = [];

        for (let i of this.points) {
            if (i[1] != 0) {
                newPoints.push([i[0], Math.log(i[1])]);
            }
        }

        const calculator = new RegressionCalculator(newPoints);
        const linEquation = calculator.linearRegression();

        const fn = (x) => { return Math.pow(Math.E, linEquation.a) * Math.pow(Math.pow(Math.E, linEquation.b), x) };
        const stringFn = `f(x) = ${Math.pow(Math.E, linEquation.a).toFixed(this.precision)} * ${Math.pow(Math.E, linEquation.b).toFixed(this.precision)} ^ x)`;
        const format = "f(x) = ab ^ x";
        const equation = { a: Math.pow(Math.E, linEquation.a), b: Math.pow(Math.E, linEquation.b), r: linEquation.r, fn: fn, stringFn: stringFn, format: format };

        return equation;
    }

    // Return the quadratic regression of the sample points
    quadraticRegression() {
        let n = this.points.length;

        let sX = 0;
        let sY = 0;
        let sX2 = 0;
        let sX3 = 0;
        let sX4 = 0;
        let sXY = 0;
        let sX2Y = 0;

        for (let i of this.points) {
            let x = i[0];
            let y = i[1];

            sX += x;
            sY += y;
            sX2 += x * x;
            sX3 += x * x * x;
            sX4 += x * x * x * x;
            sXY += x * y;
            sX2Y += x * x * y;
        };

        const intermediate = new Matrix(3, 3, [
            [sX4, sX3, sX2],
            [sX3, sX2, sX],
            [sX2, sX, n],
        ]);

        const output = Matrix.from(3, 1, [
            [sX2Y],
            [sXY],
            [sY],
        ])
        const result = intermediate.inverse().multiply(output);

        const a = result.getValue(0, 0);
        const b = result.getValue(1, 0);
        const c = result.getValue(2, 0);

        const fn = (x) => { return a * x * x + b * x + c };
        const stringFn = `f(x) = ${a.toFixed(this.precision)}x ^ 2 + ${b.toFixed(this.precision)}x + ${c.toFixed(this.precision)}`;
        const format = "f(x) = ax ^ 2 + bx + c";
        const equation = { a: a, b: b, c: c, fn: fn, stringFn: stringFn, format: format };

        return equation;
    }

    // Find the similarity coefficient between the input function and the sample points
    getSimilarity(fn) {
        const n = this.points.length;

        let sY = 0;
        let sSR = 0;
        let sST = 0;

        for (let i of this.points) {
            let x = i[0];
            let y1 = i[1];
            let y2 = fn(x);

            sY += y1;
            sSR += Math.pow(y1 - y2, 2);
        }

        sY /= n;

        for (let i of this.points) {
            sST += Math.pow(i[1] - sY, 2);
        }

        const r2 = 1 - sSR / sST;

        return r2.toFixed(this.precision);
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static neutral() {
        return new Vector2(0, 0);
    }

    static unitRand() {
        let angle = Math.random() * Math.PI * 2;

        return new Vector2(-Math.cos(angle), Math.sin(angle));
    }

    static unitRot(angle) {
        return new Vector2(-Math.cos(angle), Math.sin(angle));
    }

    static up() {
        return new Vector2(0, 1);
    }

    static upRand() {
        return new Vector2(0, Math.random());
    }

    static down() {
        return new Vector2(0, -1);
    }

    static downRand() {
        return new Vector2(0, -Math.random());
    }

    static left() {
        return new Vector2(-1, 0);
    }

    static leftRand() {
        return new Vector2(-Math.random(), 0);
    }

    static right() {
        return new Vector2(1, 0);
    }

    static rightRand() {
        return new Vector2(Math.random(), 0);
    }

    static positive() {
        return new Vector2(1, 1);
    }

    static negative() {
        return new Vector2(-1, -1);
    }

    static from(sourceArr) {
        return new Vector2(sourceArr[0], sourceArr[1]);
    }

    toString() {
        return this.x + ", " + this.y;
    }

    valueOf() {
        return this.magnitude();
    }

    array() {
        return [this.x, this.y];
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    set(v2) {
        this.x = v2.x;
        this.y = v2.y;
    }

    // basic operations that reassign values

    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
    }

    subtract(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
    }

    multiply(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
    }

    divide(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    normalise() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return;
        } else {
            this.x /= magnitude;
            this.y /= magnitude;
        }
    }

    // basic operations the maintain values and return a new vector

    sum(v2) {
        return new Vector2(this.x + v2.x, this.y + v2.y);
    }

    difference(v2) {
        return new Vector2(this.x - v2.x, this.y - v2.y);
    }

    product(v2) {
        return new Vector2(this.x * v2.x, this.y * v2.y);
    }

    quotient(v2) {
        return new Vector2(this.x / v2.x, this.y / v2.y);
    }

    distance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    squaredDistance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;

        return xDiff * xDiff + yDiff * yDiff;
    }

    scaled(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    normalised() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return new Vector2(0, 0);
        } else {
            return new Vector2(this.x / magnitude, this.y / magnitude);
        }
    }

    // other general operations

    average(v2) {
        return new Vector2((this.x + v2.x) / 2, (this.y + v2.y) / 2);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dotProd(v2) {
        return this.x * v2.x + this.y * v2.y;
    }

    dotProdSelf() {
        let x = this.x;
        let y = this.y;

        return x * x + y * y;
    }

    capNum(num) {
        if (this.x > num) {
            this.x = num;
        } else if (this.x < -num) {
            this.x = -num;
        }

        if (this.y > num) {
            this.y = num;
        } else if (this.y < -num) {
            this.y = -num;
        }
    }

    isEqual(v2, tolerance) {
        if (tolerance) {
            if (Math.abs(this.x - v2.x) < tolerance && Math.abs(this.y - v2.y) < tolerance) {
                return true;
            }
        } else {
            if (this.x == v2.x && this.y == v2.y) {
                return true;
            }
        }

        return false
    }

    lerp(v2, weight) {
        return this.sum(new Vector2(v2.x - this.x, v2.y - this.y).scaled(weight));
    }

    distance(v2) {
        return this.difference(v2).magnitude();
    }

    rotateRad(theta, origin) {
        let v1 = this.difference(origin)

        let ct = Math.cos(theta);
        let st = Math.sin(theta);

        v1.x = v1.x * ct - v1.y * st;
        v1.y = v1.x * st + v1.y * ct;

        return v1.sum(origin);
    }

    round() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    mod(num) {
        return new Vector2(this.x % num, this.y % num);
    }

    greaterThan(v2) {
        return (this.x > v2.x && this.y > v2.y);
    }

    greaterThanEq(v2) {
        return (this.x >= v2.x && this.y >= v2.y);
    }

    lessThan(v2) {
        return (this.x < v2.x && this.y < v2.y);
    }

    lessThanEq(v2) {
        return (this.x <= v2.x && this.y <= v2.y);
    }

    toVector3() {
        return new Vector3(this.x, this.y, 1);
    }

    toRowMatrix() {
        let newMatrix = Matrix.from(1, 2, [[this.x, this.y]]);
        
        return newMatrix;
    }

    toColumnMatrix() {
        let newMatrix = Matrix.from(2, 1, [[this.x], [this.y]]);

        return newMatrix;
    }
}

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static neutral() {
        return new Vector3(0, 0, 0);
    }

    static unitRand() {
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.random() * Math.PI * 2;

        return new Vector3(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
    }

    static up() {
        return new Vector3(0, 1, 0);
    }

    static down() {
        return new Vector3(0, -1, 0);
    }

    static left() {
        return new Vector3(-1, 0, 0);
    }

    static right() {
        return new Vector3(1, 0, 0);
    }

    static from(sourceArr) {
        return new Vector3(sourceArr[0], sourceArr[1], sourceArr[2]);
    }

    toString() {
        return this.x + ", " + this.y + ", " + this.z;
    }

    valueOf() {
        return this.magnitude();
    }

    array() {
        return [this.x, this.y, this.z];
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    set(v2) {
        this.x = v2.x;
        this.y = v2.y;
        this.z = v2.z;
    }

    // basic operations that reassign values

    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
        this.z += v2.z;
    }

    subtract(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        this.z -= v2.z;
    }

    multiply(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
        this.z *= v2.z;
    }

    divide(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
        this.z /= v2.z;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    normalise() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return;
        } else {
            this.x /= magnitude;
            this.y /= magnitude;
            this.z /= magnitude;
        }
    }

    // basic operations the maintain values and return a new vector

    sum(v2) {
        return new Vector3(this.x + v2.x, this.y + v2.y, this.z + v2.z);
    }

    sum1(x, y, z) {
        return new Vector3(this.x + x, this.y + y, this.z + z);
    }

    difference(v2) {
        return new Vector3(this.x - v2.x, this.y - v2.y, this.z - v2.z);
    }

    product(v2) {
        return new Vector3(this.x * v2.x, this.y * v2.y, this.z * v2.z);
    }

    quotient(v2) {
        return new Vector3(this.x / v2.x, this.y / v2.y, this.z / v2.z);
    }

    distance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
    }

    squaredDistance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;

        return xDiff * xDiff + yDiff * yDiff + zDiff * zDiff;
    }

    scaled(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    normalised() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return new Vector3(0, 0, 0);
        } else {
            return new Vector3(this.x / magnitude, this.y / magnitude, this.z / magnitude);
        }
    }

    // other general operations

    average(v2) {
        return new Vector3((this.x + v2.x) / 2, (this.y + v2.y) / 2, (this.z + v2.z) / 2);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    dotProd(v2) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z;
    }

    dotProdSelf() {
        let x = this.x;
        let y = this.y;
        let z = this.z;

        return x * x + y * y + z * z;
    }

    crossProd(v2) {
        let x = (this.y * v2.z) - (this.z * v2.y);
        let y = (this.z * v2.x) - (this.x * v2.z);
        let z = (this.x * v2.y) - (this.y * v2.x);

        return new Vector3(x, y, z);
    }

    capNum(num) {
        if (this.x > num) {
            this.x = num;
        } else if (this.x < -num) {
            this.x = -num;
        }

        if (this.y > num) {
            this.y = num;
        } else if (this.y < -num) {
            this.y = -num;
        }

        if (this.z > num) {
            this.z = num;
        } else if (this.z < -num) {
            this.z = -num;
        }
    }

    isEqual(v2, tolerance) {
        if (tolerance) {
            if (Math.abs(this.x - v2.x) < tolerance && Math.abs(this.y - v2.y) < tolerance && Math.abs(this.z - v2.z) < tolerance) {
                return true;
            }
        } else {
            if (this.x == v2.x && this.y == v2.y && this.z == v2.z) {
                return true;
            }
        }

        return false
    }

    lerp(v2, weight) {
        return this.sum(new Vector3(v2.x - this.x, v2.y - this.y, v2.z - this.z).scaled(weight));
    }


    scaleZ(scalar, origin) {
        let difference = this.difference(origin);

        if (difference.z == 0) {
            return this.clone();
        }

        return difference.scaled(scalar / difference.z);
    }

    rotateDeg(degs, origin) {
        let rads = degs.scaled(Math.PI / 180);

        return this.rotateRad(rads, origin);
    }

    rotateRad(rads, origin) {
        let v1 = this.difference(origin)

        rads.x = rads.x;
        rads.y = rads.y;
        rads.z = rads.z;

        let cx = Math.cos(rads.x);
        let sx = Math.sin(rads.x);
        let cy = Math.cos(rads.y);
        let sy = Math.sin(rads.y);
        let cz = Math.cos(rads.z);
        let sz = Math.sin(rads.z);

        let zx = v1.x * cz - v1.y * sz;
        let zy = v1.y * cz + v1.x * sz;

        let yx = zx * cy - v1.z * sy;
        let yz = v1.z * cy + zx * sy;

        let xy = zy * cx - yz * sx;
        let xz = yz * cx + zy * sx;

        v1.x = yx;
        v1.y = xy;
        v1.z = xz;

        return v1.sum(origin);
    }

    round() {
        return new Vector3(Math.round(this.x), Math.round(this.y), Math.round(this.z));
    }

    mod(num) {
        return new Vector3(this.x % num, this.y % num, this.z % num);
    }

    greaterThan(v2) {
        return (this.x > v2.x && this.y > v2.y && this.z > v2.z);
    }

    greaterThanEq(v2) {
        return (this.x >= v2.x && this.y >= v2.y && this.z >= v2.z);
    }

    lessThan(v2) {
        return (this.x < v2.x && this.y < v2.y && this.z < v2.z);
    }

    lessThanEq(v2) {
        return (this.x <= v2.x && this.y <= v2.y && this.z <= v2.z);
    }

    toVector4() {
        return new Vector4(this.x, this.y, this.z, 1);
    }

    toRowMatrix() {
        let newMatrix = Matrix.from(1, 3, [[this.x, this.y, this.z]]);

        return newMatrix;
    }

    toColumnMatrix() {
        let newMatrix = Matrix.from(3, 1, [[this.x], [this.y], [this.z]]);

        return newMatrix;
    }
}

class Vector4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static neutral() {
        return new Vector4(0, 0, 0, 0);
    }

    static up() {
        return new Vector4(0, 1, 0, 0);
    }

    static down() {
        return new Vector4(0, -1, 0, 0);
    }

    static left() {
        return new Vector4(-1, 0, 0, 0);
    }

    static right() {
        return new Vector4(1, 0, 0, 0);
    }

    static from(sourceArr) {
        return new Vector4(sourceArr[0], sourceArr[1], sourceArr[2], sourceArr[3]);
    }

    toString() {
        return this.x + ", " + this.y + ", " + this.z + ", " + this.w;
    }

    valueOf() {
        return this.magnitude();
    }

    array() {
        return [this.x, this.y, this.z, this.w];
    }

    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    set(v2) {
        this.x = v2.x;
        this.y = v2.y;
        this.z = v2.z;
        this.w = v2.w;
    }

    // basic operations that reassign values

    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
        this.z += v2.z;
        this.w += v2.w;
    }

    subtract(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        this.z -= v2.z;
        this.w -= v2.w;
    }

    multiply(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
        this.z *= v2.z;
        this.w *= v2.w;
    }

    divide(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
        this.z /= v2.z;
        this.w /= v2.w;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
    }

    normalise() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return;
        } else {
            this.x /= magnitude;
            this.y /= magnitude;
            this.z /= magnitude;
            this.w /= magnitude;
        }
    }

    // basic operations the maintain values and return a new vector

    sum(v2) {
        return new Vector4(this.x + v2.x, this.y + v2.y, this.z + v2.z, this.w + v2.w);
    }

    difference(v2) {
        return new Vector4(this.x - v2.x, this.y - v2.y, this.z - v2.z, this.w - v2.w);
    }

    product(v2) {
        return new Vector4(this.x * v2.x, this.y * v2.y, this.z * v2.z, this.w * v2.w);
    }

    quotient(v2) {
        return new Vector4(this.x / v2.x, this.y / v2.y, this.z / v2.z, this.w / v2.w);
    }

    distance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;
        let wDiff = this.w - v2.w;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff + wDiff * wDiff);
    }

    squaredDistance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;
        let wDiff = this.w - v2.w;

        return xDiff * xDiff + yDiff * yDiff + zDiff * zDiff + wDiff * wDiff;
    }

    scaled(scalar) {
        return new Vector4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }

    normalised() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return new Vector4(0, 0, 0, 0);
        } else {
            return new Vector4(this.x / magnitude, this.y / magnitude, this.z / magnitude, this.w / magnitude);
        }
    }

    // other general operations

    average(v2) {
        return new Vector3((this.x + v2.x) / 2, (this.y + v2.y) / 2, (this.z + v2.z) / 2, (this.w + v2.w) / 2);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    dotProd(v2) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z + this.w * v2.w;
    }

    dotProdSelf() {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let w = this.w;

        return x * x + y * y + z * z + w * w;
    }

    capNum(num) {
        if (this.x > num) {
            this.x = num;
        } else if (this.x < -num) {
            this.x = -num;
        }

        if (this.y > num) {
            this.y = num;
        } else if (this.y < -num) {
            this.y = -num;
        }

        if (this.z > num) {
            this.z = num;
        } else if (this.z < -num) {
            this.z = -num;
        }

        if (this.w > num) {
            this.w = num;
        } else if (this.w < -num) {
            this.w = -num;
        }
    }

    lerp(v2, weight) {
        return this.sum(new Vector4(v2.x - this.x, v2.y - this.y, v2.z - this.z, v2.w - this.w).scaled(weight));
    }

    round() {
        return new Vector4(Math.round(this.x), Math.round(this.y), Math.round(this.z), Math.round(this.w));
    }

    mod(num) {
        return new Vector4(this.x % num, this.y % num, this.z % num, this.w % num);
    }

    toRowMatrix() {
        let newMatrix = Matrix.from(1, 4, [[this.x, this.y, this.z, this.w]]);
        
        return newMatrix;
    }

    toColumnMatrix() {
        let newMatrix = Matrix.from(4, 1, [[this.x], [this.y], [this.z], [this.w]]);

        return newMatrix;
    }
}

class Perlin {
    constructor(seed) {
        seed = String(seed);

        let seedSum = 0;

        for (let x = 0; x < seed.length; x++) {
            seedSum += seed.charCodeAt(x);
        }

        this.seed = seedSum;
        
        let grad = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
        let p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

        var perm = new Array(512);
        var gradP = new Array(512);

        for(var i = 0; i < 256; i++) {
            var v;
            if (i & 1) {
                v = p[i] ^ (seedSum & 255);
            } else {
                v = p[i] ^ ((seedSum>>8) & 255);
            }

            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = grad[v % 12];
        }

        this.perm = perm;
        this.gradP = gradP;

        this.randLookup = {};

        this.frequency = 1.0;
        this.roughness = 1.0;
        this.amplitude = 1.0;
        this.persistence = 1.0;
        this.cellSize = 1.0;
        this.octaves = 1;
        this.contrast = 1.0;
    }

    settings(frequency, roughness, amplitude, persistence, cellSize, octaves, contrast) {
        this.frequency = frequency;
        this.roughness = roughness;
        this.amplitude = amplitude;
        this.persistence = persistence;
        this.cellSize = cellSize;
        this.octaves = octaves;
        this.contrast = contrast;
    }

    dot2(v1, x2, y2) {
        return v1[0] * x2 + v1[1] * y2;
    }

    dot3(v1, x2, y2, z2) {
        return v1[0] * x2 + v1[1] * y2 + v1[2] * z2;
    }

    interpolate(val1, val2, weight) {
        let val = val1 + (val2 - val1) * weight;
        return val;
    }

    ease(t) {
        let t3 = 10 * t * t * t;
        let t4 = 1.5 * t3 * t;
        let t5 = 0.4 * t4 * t;

        return t5 - t4 + t3;
    }

    perlin(x0, y0) {
        let frequency = this.frequency;
        let roughness = this.roughness;
        let amplitude = this.amplitude;
        let persistence = this.persistence;
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;

        x0 /= cellSize;
        y0 /= cellSize;

        let frequencies = [];
        let amplitudes = [];

        for (let i = 0; i < octaves; i++) {
            frequencies[i] = frequency * Math.pow(roughness, i);
            amplitudes[i] = amplitude * Math.pow(persistence, i);
        }

        let val = 0;

        for (let i = 0; i < octaves; i++) {
            let frequency1 = frequencies[i];
            let amplitude1 = amplitudes[i];

            let x = x0 * frequency1;
            let y = y0 * frequency1;
    
            let x1 = x << 0;
            let y1 = y << 0;

            x1 &= 255;
            y1 &= 255;

            let x2 = x1 + 1;
            let y2 = y1 + 1;
    
            let x3 = x - x1;
            let y3 = y - y1;
            let x4 = x3 - 1;
            let y4 = y3 - 1;
    
            let dotProd1 = this.dot2(gradP[x1 + perm[y1]], x3, y3);
            let dotProd2 = this.dot2(gradP[x2 + perm[y1]], x4, y3);
            let dotProd3 = this.dot2(gradP[x1 + perm[y2]], x3, y4);
            let dotProd4 = this.dot2(gradP[x2 + perm[y2]], x4, y4);

            let x3_1 = 1 - (x3 = this.ease(x3));
            let y3_1 = 1 - (y3 = this.ease(y3));
            
            val += (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) * amplitude1;
        }

        return val * contrast;
    }

    perlin3(x0, y0, z0) {
        let frequency = this.frequency;
        let roughness = this.roughness;
        let amplitude = this.amplitude;
        let persistence = this.persistence;
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;

        x0 /= cellSize;
        y0 /= cellSize;
        z0 /= cellSize;

        let frequencies = [];
        let amplitudes = [];

        for (let i = 0; i < octaves; i++) {
            frequencies[i] = frequency * Math.pow(roughness, i);
            amplitudes[i] = amplitude * Math.pow(persistence, i);
        }

        let val = 0;

        for (let i = 0; i < octaves; i++) {
            let frequency1 = frequencies[i];
            let amplitude1 = amplitudes[i];

            let x = x0 * frequency1;
            let y = y0 * frequency1;
            let z = z0 * frequency1;
    
            let x1 = x << 0;
            let y1 = y << 0;
            let z1 = z << 0;

            x1 &= 255;
            y1 &= 255;
            z1 &= 255;

            let x2 = x1 + 1;
            let y2 = y1 + 1;
            let z2 = z1 + 1;
    
            let x3 = x - x1;
            let y3 = y - y1;
            let z3 = z - z1;
            let x4 = x3 - 1;
            let y4 = y3 - 1;
            let z4 = z3 - 1;
    
            let dotProd1 = this.dot3(gradP[x1 + perm[y1 + perm[z1]]], x3, y3, z3);
            let dotProd2 = this.dot3(gradP[x2 + perm[y1 + perm[z1]]], x4, y3, z3);
            let dotProd3 = this.dot3(gradP[x1 + perm[y2 + perm[z1]]], x3, y4, z3);
            let dotProd4 = this.dot3(gradP[x2 + perm[y2 + perm[z1]]], x4, y4, z3);

            let dotProd5 = this.dot3(gradP[x1 + perm[y1 + perm[z2]]], x3, y3, z4);
            let dotProd6 = this.dot3(gradP[x2 + perm[y1 + perm[z2]]], x4, y3, z4);
            let dotProd7 = this.dot3(gradP[x1 + perm[y2 + perm[z2]]], x3, y4, z4);
            let dotProd8 = this.dot3(gradP[x2 + perm[y2 + perm[z2]]], x4, y4, z4);

            let x3_1 = 1 - (x3 = this.ease(x3));
            let y3_1 = 1 - (y3 = this.ease(y3));
            let z3_1 = 1 - (z3 = this.ease(z3));
            
            val += (z3_1 * (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) + z3 * (y3_1 * (x3_1 * dotProd5 + x3 * dotProd6) + y3 * (x3_1 * dotProd7 + x3 * dotProd8))) * amplitude1;
        }

        return val * contrast;
    }

    perlinBuffer(width, height, offsetX = 0, offsetY = 0) {
        let buffer = new Float32Array(width * height);

        let frequency = this.frequency;
        let roughness = this.roughness;
        let amplitude = this.amplitude;
        let persistence = this.persistence;
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;

        let dot2 = this.dot2;
        let ease = this.ease;

        let frequencies = [];
        let amplitudes = [];

        for (let i = 0; i < octaves; i++) {
            frequencies[i] = frequency * Math.pow(roughness, i);
            amplitudes[i] = amplitude * Math.pow(persistence, i);
        }

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let x0 = (i + offsetX) / cellSize;
                let y0 = (j + offsetY) / cellSize;

                let index = i + j * width;

                let val = 0;

                for (let k = 0; k < octaves; k++) {
                    let frequency1 = frequencies[k];
                    let amplitude1 = amplitudes[k];

                    let x = x0 * frequency1;
                    let y = y0 * frequency1;
            
                    let x1 = x << 0;
                    let y1 = y << 0;

                    x1 &= 255;
                    y1 &= 255;

                    let x2 = x1 + 1;
                    let y2 = y1 + 1;
            
                    let x3 = x - x1;
                    let y3 = y - y1;
                    let x4 = x3 - 1;
                    let y4 = y3 - 1;
            
                    let dotProd1 = dot2(gradP[x1 + perm[y1]], x3, y3);
                    let dotProd2 = dot2(gradP[x2 + perm[y1]], x4, y3);
                    let dotProd3 = dot2(gradP[x1 + perm[y2]], x3, y4);
                    let dotProd4 = dot2(gradP[x2 + perm[y2]], x4, y4);

                    let x3_1 = 1 - (x3 = ease(x3));
                    let y3_1 = 1 - (y3 = ease(y3));
                    
                    val += (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) * amplitude1;
                }

                buffer[index] = val * contrast;
            }
        }

        return buffer;
    }

    perlinBuffer3(width, height, z0, offsetX = 0, offsetY = 0) {
        let buffer = new Float32Array(width * height);

        let frequency = this.frequency;
        let roughness = this.roughness;
        let amplitude = this.amplitude;
        let persistence = this.persistence;
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;

        let dot3 = this.dot3;
        let ease = this.ease;

        z0 /= cellSize;

        let frequencies = [];
        let amplitudes = [];

        for (let i = 0; i < octaves; i++) {
            frequencies[i] = frequency * Math.pow(roughness, i);
            amplitudes[i] = amplitude * Math.pow(persistence, i);
        }

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let x0 = (i + offsetX) / cellSize;
                let y0 = (j + offsetY) / cellSize;

                let index = i + j * width;

                let val = 0;

                for (let k = 0; k < octaves; k++) {
                    let frequency1 = frequencies[k];
                    let amplitude1 = amplitudes[k];

                    let x = x0 * frequency1;
                    let y = y0 * frequency1;
                    let z = z0 * frequency1;
            
                    let x1 = x << 0;
                    let y1 = y << 0;
                    let z1 = z << 0;

                    x1 &= 255;
                    y1 &= 255;
                    z1 &= 255;

                    let x2 = x1 + 1;
                    let y2 = y1 + 1;
                    let z2 = z1 + 1;
            
                    let x3 = x - x1;
                    let y3 = y - y1;
                    let z3 = z - z1;
                    let x4 = x3 - 1;
                    let y4 = y3 - 1;
                    let z4 = z3 - 1;
            
                    let dotProd1 = dot3(gradP[x1 + perm[y1 + perm[z1]]], x3, y3, z3);
                    let dotProd2 = dot3(gradP[x2 + perm[y1 + perm[z1]]], x4, y3, z3);
                    let dotProd3 = dot3(gradP[x1 + perm[y2 + perm[z1]]], x3, y4, z3);
                    let dotProd4 = dot3(gradP[x2 + perm[y2 + perm[z1]]], x4, y4, z3);
            
                    let dotProd5 = dot3(gradP[x1 + perm[y1 + perm[z2]]], x3, y3, z4);
                    let dotProd6 = dot3(gradP[x2 + perm[y1 + perm[z2]]], x4, y3, z4);
                    let dotProd7 = dot3(gradP[x1 + perm[y2 + perm[z2]]], x3, y4, z4);
                    let dotProd8 = dot3(gradP[x2 + perm[y2 + perm[z2]]], x4, y4, z4);

                    let x3_1 = 1 - (x3 = ease(x3));
                    let y3_1 = 1 - (y3 = ease(y3));
                    let z3_1 = 1 - (z3 = ease(z3));
                    
                    val += (z3_1 * (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) + z3 * (y3_1 * (x3_1 * dotProd5 + x3 * dotProd6) + y3 * (x3_1 * dotProd7 + x3 * dotProd8))) * amplitude1;
                }

                buffer[index] = val * contrast;
            }
        }

        return buffer;
    }
}