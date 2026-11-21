#include <bits/stdc++.h>
using namespace std;

// 六個旋轉面
const string Step[6] = {"R", "L", "U", "D", "F", "B"};

// 三種旋轉方式
const string Rotation[3] = {"", "'", "2"};

// 隨機數產生器
mt19937 rng(random_device{}());

// 產生指定範圍的隨機整數
int randomInt(int left, int right) {
    uniform_int_distribution<int> dist(left, right);
    return dist(rng);
}

// 判斷兩個面是否屬於同一軸
bool sameAxis(int a, int b) {
    return a / 2 == b / 2;
}

// 判斷新步驟是否合法
bool sameStep(const vector<int>& history, int newStep) {
    int n = history.size();

    if (n == 0)
        return false;

    int last = history[n - 1];

    // 不允許連續轉動相同面
    if (last == newStep)
        return true;

    // 避免 A B A 形式，其中 A、B 為相對面
    if (n >= 2) {
        int previous = history[n - 2];

        if (previous == newStep &&
            sameAxis(previous, last)) {
            return true;
        }
    }

    return false;
}

// 產生合法的下一步
int sameChange(const vector<int>& history) {
    int newStep;

    do {
        newStep = randomInt(0, 5);
    } while (sameStep(history, newStep));

    return newStep;
}

// 輸出旋轉公式
void ChooseStep(int step, int rotation) {
    cout << Step[step] << Rotation[rotation];
}

// 產生打亂公式
void generateScramble(int num) {
    vector<int> history;

    cout << "Scramble:\n";

    for (int i = 0; i < num; i++) {
        int newStep = sameChange(history);
        int rotation = randomInt(0, 2);

        ChooseStep(newStep, rotation);

        history.push_back(newStep);

        if (i != num - 1)
            cout << " ";
    }

    cout << "\n";
}

int main() {
    generateScramble(20);
    return 0;
}
