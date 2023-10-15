#include <bits/stdc++.h>
using namespace std;

string Step[6] = {"R", "L", "U", "D", "F", "B"};
int times[2] = {1, 2};
bool P[2] = {true, false};

void ChooseStep(string &lastStep, int &lastTime, bool &lastP, string &newStep, int &newTime, bool &newP);
bool AreStepsEqual(const string &lastStep, int lastTime, bool lastP, const string &newStep, int newTime, bool newP);
bool sameStep(string &lastStep, int &lastTime, bool &lastP, string &newStep, int &newTime, bool &newP);
void sameChange(string &lastStep, int &lastTime, bool &lastP, string &newStep, int &newTime, bool &newP);

int main() {
    srand(time(NULL));
    int num = 18 + (rand() % 5);
    cout << "Scramble: \n";

    //儲存上一次步驟
    string lastStep = "";  
    int lastTime = 0;     
    bool lastP = false;   

    for (int i = 0; i < num; i++) 
    {
        string newStep;
        int newTime;
        bool newP;
        sameChange(lastStep, lastTime, lastP, newStep, newTime, newP);
        
        ChooseStep(lastStep, lastTime, lastP, newStep, newTime, newP);

        lastStep = newStep;
        lastTime = newTime;
        lastP = newP;
    }
    return 0;
}

bool AreStepsEqual(const string &lastStep, int lastTime, bool lastP, const string &newStep, int newTime, bool newP) {
    return (lastStep == newStep && lastTime == newTime && lastP == newP) || 
           ((lastStep == "R" && lastTime == 2) && (newStep == "R" && newTime == 1 && newP == false)) || 
           ((lastStep == "R" && lastTime == 1 && lastP == false) && (newStep == "R" && newTime == 2)) ||
           ((lastStep == "R" && lastTime == 1 && lastP == true) && (newStep == "R" && newTime == 1 && lastP == false)) ||
           ((lastStep == "R" && lastTime == 1 && lastP == false) && (newStep == "R" && newTime == 1 && newP == true)) ||
           ((lastStep == "R" && lastTime == 2) && (newStep == "R" && newTime == 1 && newP == true)) || 
           ((lastStep == "R" && lastTime == 1 && lastP == true) && (newStep == "R" && newTime == 2)) ||
           ((lastStep == "L" && lastTime == 2) && (newStep == "L" && newTime == 1 && newP == false)) || 
           ((lastStep == "L" && lastTime == 1 && lastP == false) && (newStep == "L" && newTime == 2)) ||
           ((lastStep == "L" && lastTime == 1 && lastP == true) && (newStep == "L" && newTime == 1 && lastP == false)) ||
           ((lastStep == "L" && lastTime == 1 && lastP == false) && (newStep == "L" && newTime == 1 && newP == true)) ||
           ((lastStep == "L" && lastTime == 2) && (newStep == "L" && newTime == 1 && newP == true)) || 
           ((lastStep == "L" && lastTime == 1 && lastP == true) && (newStep == "L" && newTime == 2)) ||
           ((lastStep == "U" && lastTime == 2) && (newStep == "U" && newTime == 1 && newP == false)) || 
           ((lastStep == "U" && lastTime == 1 && lastP == false) && (newStep == "U" && newTime == 2)) ||
           ((lastStep == "U" && lastTime == 1 && lastP == true) && (newStep == "U" && newTime == 1 && lastP == false)) ||
           ((lastStep == "U" && lastTime == 1 && lastP == false) && (newStep == "U" && newTime == 1 && newP == true)) ||
           ((lastStep == "U" && lastTime == 2) && (newStep == "U" && newTime == 1 && newP == true)) || 
           ((lastStep == "U" && lastTime == 1 && lastP == true) && (newStep == "U" && newTime == 2)) ||
           ((lastStep == "D" && lastTime == 2) && (newStep == "D" && newTime == 1 && newP == false)) || 
           ((lastStep == "D" && lastTime == 1 && lastP == false) && (newStep == "D" && newTime == 2)) ||
           ((lastStep == "D" && lastTime == 1 && lastP == true) && (newStep == "D" && newTime == 1 && lastP == false)) ||
           ((lastStep == "D" && lastTime == 1 && lastP == false) && (newStep == "D" && newTime == 1 && newP == true)) ||
           ((lastStep == "D" && lastTime == 2) && (newStep == "D" && newTime == 1 && newP == true)) || 
           ((lastStep == "D" && lastTime == 1 && lastP == true) && (newStep == "D" && newTime == 2)) ||
           ((lastStep == "F" && lastTime == 2) && (newStep == "F" && newTime == 1 && newP == false)) || 
           ((lastStep == "F" && lastTime == 1 && lastP == false) && (newStep == "F" && newTime == 2)) ||
           ((lastStep == "F" && lastTime == 1 && lastP == true) && (newStep == "F" && newTime == 1 && lastP == false)) ||
           ((lastStep == "F" && lastTime == 1 && lastP == false) && (newStep == "F" && newTime == 1 && newP == true)) ||
           ((lastStep == "F" && lastTime == 2) && (newStep == "F" && newTime == 1 && newP == true)) || 
           ((lastStep == "F" && lastTime == 1 && lastP == true) && (newStep == "F" && newTime == 2)) ||
           ((lastStep == "B" && lastTime == 2) && (newStep == "B" && newTime == 1 && newP == false)) || 
           ((lastStep == "B" && lastTime == 1 && lastP == false) && (newStep == "B" && newTime == 2)) ||
           ((lastStep == "B" && lastTime == 1 && lastP == true) && (newStep == "B" && newTime == 1 && lastP == false)) ||
           ((lastStep == "B" && lastTime == 1 && lastP == false) && (newStep == "B" && newTime == 1 && newP == true)) ||
           ((lastStep == "B" && lastTime == 2) && (newStep == "B" && newTime == 1 && newP == true)) || 
           ((lastStep == "B" && lastTime == 1 && lastP == true) && (newStep == "B" && newTime == 2)) ;
}


bool sameStep(string &lastStep, int &lastTime, bool &lastP, string &newStep, int &newTime, bool &newP)
{
    return (AreStepsEqual(lastStep, lastTime, lastP, newStep, newTime, newP));
}


void sameChange(string &lastStep, int &lastTime, bool &lastP, string &newStep, int &newTime, bool &newP) 
{
    //如果步驟一樣，更換新步驟
    do {
        newStep = Step[rand() % 6];
        newTime = times[rand() % 2];
        newP = P[rand() % 2];
    } while (sameStep(lastStep, lastTime, lastP, newStep, newTime, newP));
}

void ChooseStep(string &lastStep, int &lastTime, bool &lastP, string &newStep, int &newTime, bool &newP)
{
    cout << newStep;
    if (newTime == 2) 
    {
        cout << "2 ";
    } 
    else if (newTime == 1) 
    {
        if (newP) cout << "' ";
            
        else cout << " ";
    }
}
