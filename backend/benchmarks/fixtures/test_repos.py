"""Synthetic test repositories and code snippets for benchmarking."""

# Test repository definitions for static analysis benchmarking
TEST_REPOS = {
    "simple_python": {
        "files": {
            "main.py": """
import os
import subprocess

# Bug: hardcoded API key
API_KEY = "sk-1234567890abcdef"

def run_command(user_input):
    # Bug: eval() is dangerous
    result = eval(user_input)
    return result

def query_database(query):
    # Bug: os.system with untrusted input
    os.system(f"sqlite3 db.sql '{query}'")

# TODO: implement caching
# FIXME: handle null responses
""",
            "config.py": """
SECRET = "super_secret_password_123"
DATABASE_URL = "postgres://admin:password@localhost/db"
""",
            "requirements.txt": """
requests
pandas>=1.0.0
numpy
SQLAlchemy>=1.4
""",
        }
    },
    "react_frontend": {
        "files": {
            "components/UserProfile.tsx": """
export interface UserProfileProps {
  user: {
    id: string;
    name: string;
    settings?: {
      notifications?: {
        enabled: boolean;
      };
    } | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="profile-card">
      <h3>{user.name}</h3>
      <span>{user.settings.notifications.enabled ? 'Active' : 'Muted'}</span>
    </div>
  );
}
""",
            "components/Dashboard.tsx": """
export function Dashboard({ userId }: { userId: string }) {
  const userData = fetch(`/api/user/${userId}`).then(r => r.json());

  return (
    <div>
      <h1>Dashboard</h1>
      <div innerHTML={userData.bio}></div>
    </div>
  );
}
""",
            "package.json": """
{
  "name": "repolens-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "next": "^16.0.0",
    "axios": "*"
  }
}
""",
        }
    },
    "java_backend": {
        "files": {
            "UserService.java": """
public class UserService {
    private Database db;

    public void deleteUser(String userId) {
        try {
            String query = "DELETE FROM users WHERE id = " + userId;
            db.execute(query);
        } catch (Exception e) {
            // Bug: bare except catches all errors
        }
    }

    public List<User> getUsers(int limit) {
        // Bug: off-by-one error in pagination
        for (int i = 0; i <= limit; i++) {
            users.add(db.getUser(i));
        }
        return users;
    }

    private String longFunction() {
        if (condition1) {
            if (condition2) {
                if (condition3) {
                    if (condition4) {
                        if (condition5) {
                            // Bug: deeply nested, hard to maintain
                            performAction();
                        }
                    }
                }
            }
        }
        return result;
    }
}
""",
        }
    },
}

# Simple synthetic repos for specific test scenarios
MINIMAL_REPOS = {
    "empty_repo": {
        "files": {
            "README.md": "# Empty Repository",
        }
    },
    "no_issues_repo": {
        "files": {
            "good_code.py": """
def safe_function(value: int) -> int:
    if value is not None and isinstance(value, int):
        return value * 2
    return 0
""",
        }
    },
}
