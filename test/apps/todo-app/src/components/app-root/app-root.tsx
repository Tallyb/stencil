import { Component, State, h } from '@stencil/core';


@Component({
  tag: 'app-root'
})
export class AppRoot {
  @State() list: TodoItem[] = [
    { text: 'my initial todo', checked: false },
    { text: 'Learn about Web Components', checked: true }
  ];

  inputSubmiHandler = (e: CustomEvent) => {
    this.list = [...this.list, { text: e.detail, checked: false, }];
  }

  itemCheckedHandler = (e: CustomEvent) => {
    const list = [...this.list];
    const item = list[e.detail];
    list[e.detail] = Object.assign({}, item, { checked: !item.checked });
    this.list = list;
  }

  itemRemoveHandler = (e: CustomEvent) => {
    this.list = [...this.list.slice(0, e.detail), ...this.list.slice(e.detail + 1)];
  }

  render() {
    return (
      <div>
        <header class="header">
          <h1>Todos Stencil</h1>
          <todo-input onInputSubmit={this.inputSubmiHandler}></todo-input>
        </header>
        <section class="main">
          <input id="toggle-all" class="toggle-all" type="checkbox"/>
          <label htmlFor="toggle-all"/>
          <ul class="todo-list">
            {this.list.map((item, index) => (
              <todo-item
                onItemCheck={this.itemCheckedHandler}
                onItemRemove={this.itemRemoveHandler}
                checked={item.checked}
                text={item.text}
                index={index}
              />
            ))}
          </ul>
        </section>
      </div>
    );
  }
}

interface TodoItem {
  text: string;
  checked: boolean;
}
