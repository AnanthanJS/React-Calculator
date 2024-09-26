import { useReducer, useState } from "react";
import "./App.css";
import { DigitButton } from "./DigitButton";
import { OperationButton } from "./OperationButton";

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
  ADD_CONSTANT: "add-constant",
};

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      }
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state;
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state;
      }
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      };
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        };
      }
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }

      // Allow log operation only if currentOperand is valid and not zero
      // if (payload.operation === "log") {
      //   if (state.currentOperand == null || parseFloat(state.currentOperand) <= 0) {
      //     return state; // Ignore if no current operand or it's zero/invalid
      //   }
      //   return {
      //     ...state,
      //     previousOperand: state.currentOperand, // Set current as previous for log
      //     operation: payload.operation,
      //     currentOperand: null, // Reset current to get the result in the next evaluate
      //   };
      // }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };
    case ACTIONS.CLEAR:
      return {};

    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null,
        };
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };

    case ACTIONS.ADD_CONSTANT:
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.value}`,
      };
  }
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
});

function formatOperand(operand) {
  if (operand == null) return;
  const [integer, decimal] = operand.split(".");
  if (decimal == null) return INTEGER_FORMATTER.format(integer);
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  if (isNaN(prev) || isNaN(current)) return "";
  let computation = "";
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "/":
      if (current === 0) return "Error";
      computation = prev / current;
      break;
    case "%":
      computation = prev % current;
      break;
    case "^": // Handling exponentiation
      computation = Math.pow(prev, current);
      break;
    // case "log": // Logarithmic operation
    //   if (current < 0) {
    //     return "Error";
    //   }
    //   // if (prev === 0) return "0";
    //   computation = Math.log10(current);
    //   break;
  }

  return computation.toString();
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    { currentOperand: "0" }
  );

  // State to keep track of which div is visible
  const [isFirstVisible, setIsFirstVisible] = useState(true);

  // Toggle function to switch between the two divs
  const toggleDiv = () => {
    setIsFirstVisible(!isFirstVisible);
  };

  return (
    <>
    {!isFirstVisible && (
      <div className="calculator-grid">
        <div className="output">
          <div className="previous-operand">
            {formatOperand(previousOperand)} {operation}
          </div>
          <div className="current-operand">{formatOperand(currentOperand)}</div>
        </div>
        <button
          onClick={toggleDiv}
        >
          SC
        </button>
        <button
          onClick={() => dispatch({ type: ACTIONS.CLEAR })}
        >
          AC
        </button>
        <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
          DEL
        </button>
        <OperationButton operation="/" dispatch={dispatch} />
        <DigitButton digit="7" dispatch={dispatch} />
        <DigitButton digit="8" dispatch={dispatch} />
        <DigitButton digit="9" dispatch={dispatch} />
        <OperationButton operation="*" dispatch={dispatch} />
        <DigitButton digit="4" dispatch={dispatch} />
        <DigitButton digit="5" dispatch={dispatch} />
        <DigitButton digit="6" dispatch={dispatch} />
        <OperationButton operation="+" dispatch={dispatch} />
        <DigitButton digit="1" dispatch={dispatch} />
        <DigitButton digit="2" dispatch={dispatch} />
        <DigitButton digit="3" dispatch={dispatch} />
        <OperationButton operation="-" dispatch={dispatch} />
        <DigitButton digit="." dispatch={dispatch} />
        <DigitButton digit="0" dispatch={dispatch} />
        <button
          className="span-two"
          onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
        >
          =
        </button>
      </div>
    )}

    {/* Scientific Grid ==============> */}

    {isFirstVisible && (
      <div className="s-calculator-grid">
        <div className="s-output">
          <div className="s-previous-operand">
            {formatOperand(previousOperand)} {operation}
          </div>
          <div className="s-current-operand">{formatOperand(currentOperand)}</div>
        </div>
        <button
          onClick={toggleDiv}
        >
          SC
        </button>
        <button
          onClick={() => dispatch({ type: ACTIONS.CLEAR })}
        >
          AC
        </button>
        <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
          DEL
        </button>
        <DigitButton digit="7" dispatch={dispatch} />
        <DigitButton digit="8" dispatch={dispatch} />
        <DigitButton digit="9" dispatch={dispatch} />
        <OperationButton operation="/" dispatch={dispatch} />
        <OperationButton operation="Inv" dispatch={dispatch} />
        <OperationButton operation="sin" dispatch={dispatch} />
        <OperationButton operation="%" dispatch={dispatch} />
        <DigitButton digit="4" dispatch={dispatch} />
        <DigitButton digit="5" dispatch={dispatch} />
        <DigitButton digit="6" dispatch={dispatch} />
        <OperationButton operation="*" dispatch={dispatch} />
        <button
          onClick={() =>
            dispatch({ type: ACTIONS.ADD_CONSTANT, payload: { value: Math.PI } })
          }
        >
          π
        </button>
        <OperationButton operation="cos" dispatch={dispatch} />
        <OperationButton operation="log" dispatch={dispatch} />
        <DigitButton digit="1" dispatch={dispatch} />
        <DigitButton digit="2" dispatch={dispatch} />
        <DigitButton digit="3" dispatch={dispatch} />
        <OperationButton operation="-" dispatch={dispatch} />
        <OperationButton operation="^" dispatch={dispatch} />
        <OperationButton operation="tan" dispatch={dispatch} />
        <DigitButton digit="." dispatch={dispatch} />
        <DigitButton digit="0" dispatch={dispatch} />
        <button
          className="s-span-two"
          onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
        >
          =
        </button>
        <OperationButton operation="+" dispatch={dispatch} />
      </div>
    )}
    </>
  );
}

export default App;
